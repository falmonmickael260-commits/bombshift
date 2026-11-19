import type { MapDefinition } from '../maps';

export interface SpeedEntry { rank: number; username: string; best_time_ms: number }
export function formatSpeedTime(ms: number): string {
  const centiseconds = Math.floor(ms / 10);
  return `${Math.floor(centiseconds / 6000)}:${String(Math.floor(centiseconds / 100) % 60).padStart(2, '0')}.${String(centiseconds % 100).padStart(2, '0')}`;
}
export function parseSpeedEntries(value: unknown): SpeedEntry[] {
  if (!Array.isArray(value)) throw Error('Classement invalide');
  return value.slice(0,5).map((entry) => {
    if (!entry || typeof entry.username !== 'string' || !Number.isInteger(entry.best_time_ms) || entry.best_time_ms <= 0 || entry.best_time_ms > 86_400_000) throw Error('Temps invalide');
    return { rank: 0, username: entry.username.slice(0,64), best_time_ms: entry.best_time_ms };
  }).sort((a,b)=>a.best_time_ms-b.best_time_ms).map((e,i)=>({...e,rank:i+1}));
}

/** A failed ranking request must never delay a game or a progress save. */
export function mountSpeedLeaderboard(container: HTMLElement, def: MapDefinition, platformOrigin: string | null, authenticated: boolean): () => void {
  container.querySelector('.speed-board')?.remove();
  const panel=document.createElement('section');panel.className='speed-board';panel.setAttribute('aria-label',`Top 5 rapidité du niveau ${def.index+1}`);
  const heading=document.createElement('h3');heading.textContent=`TOP 5 RAPIDITÉ · NIVEAU ${def.index+1}`;
  const note=document.createElement('p');note.className='speed-board__note';note.textContent='Meilleur temps par joueur · tous modes · temps de jeu hors pauses';
  const content=document.createElement('div');content.setAttribute('aria-live','polite');
  const refresh=document.createElement('button');refresh.type='button';refresh.className='btn btn--ghost';refresh.textContent='ACTUALISER LE TOP 5';
  const account=document.createElement('p');account.className='speed-board__note';account.textContent=authenticated?'Tes victoires apparaissent après la synchronisation du compte.':'Connecte-toi via Revanche Games pour inscrire tes temps. Tes records locaux restent sauvegardés.';
  panel.append(heading,note,content,refresh,account);container.append(panel);
  const origin=platformOrigin ?? 'https://revanchegames-production.up.railway.app';
  let request:AbortController|null=null;let disposed=false;
  const load=async():Promise<void>=>{
    request?.abort();const active=new AbortController();request=active;
    const timeout=window.setTimeout(()=>active.abort(),8000);
    refresh.disabled=true;content.textContent='Chargement des meilleurs temps…';
    try{
      const response=await fetch(`${origin}/api/bombshift/leaderboard?mapId=${encodeURIComponent(def.id)}`,{signal:active.signal,credentials:'omit',cache:'no-store'});
      if(!response.ok)throw Error('Indisponible');const data=await response.json();
      if(data.mapId!==def.id)throw Error('Mauvais niveau');const entries=parseSpeedEntries(data.entries);
      if(disposed||request!==active)return;
      content.replaceChildren();
      if(!entries.length)content.textContent='Aucun temps enregistré. Sois le premier à terminer ce niveau !';
      else{
        const table=document.createElement('table');table.className='speed-board__table';
        const caption=document.createElement('caption');caption.textContent=def.name;table.append(caption);
        const head=document.createElement('thead');const labels=document.createElement('tr');
        for(const text of ['Place','Joueur','Temps']){const th=document.createElement('th');th.scope='col';th.textContent=text;labels.append(th);}head.append(labels);table.append(head);
        const body=document.createElement('tbody');
        for(const entry of entries){const row=document.createElement('tr');for(const text of [`${entry.rank}`,entry.username,formatSpeedTime(entry.best_time_ms)]){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}body.append(row);}table.append(body);content.append(table);
      }
    }catch{if(!disposed&&request===active)content.textContent='Classement temporairement indisponible. Tu peux continuer à jouer et réessayer.';}
    finally{window.clearTimeout(timeout);if(!disposed&&request===active)refresh.disabled=false;}
  };
  refresh.onclick=()=>{void load();};
  const synced=():void=>{void load();};window.addEventListener('bombshift:account-synced',synced);
  void load();
  return()=>{disposed=true;request?.abort();window.removeEventListener('bombshift:account-synced',synced);panel.remove();};
}
