# Campagne 80 et classement de rapidité

La campagne conserve les 60 premières cartes et leurs identifiants de sauvegarde.
Les niveaux 61–80 ajoutent quatre univers : jungle, confiseries, abysses et colonie lunaire.
Les niveaux 70 et 80 inversent les deux axes de déplacement, comme tous les multiples de dix.
Chaque nouvelle carte possède un tracé fixe, trois objectifs de collecte/charge, un gardien,
des consoles, deux secrets et douze ennemis. Les consoles déclenchées par explosion sont
obligatoires. Les rubans des confiseries affectent aussi les bombes.

Le top 5 est affiché dans le briefing et sur le résultat de chaque niveau.
Il affiche le meilleur temps de jeu par compte Revanche Games, tous modes confondus,
dans l’ordre croissant, au centième. Les pauses et les publicités ne comptent pas.
Les temps déjà synchronisés sont repris. Un invité conserve ses records localement ;
il doit lancer le jeu depuis son compte sur la plateforme pour les synchroniser.
Une synchronisation réussie actualise le tableau visible. Le bouton Actualiser permet
également une nouvelle lecture ; une panne du classement ne bloque jamais la partie.

La plateforme expose GET /api/bombshift/leaderboard?mapId=level-61.
Cette lecture publique ne renvoie que le rang, le nom public et le temps, au maximum cinq lignes.
Elle ne renvoie ni identifiant de compte ni sauvegarde. Les noms privés sont anonymisés.
La fonction SQL est SECURITY INVOKER et exécutable uniquement par service_role côté serveur.
Les victoires sont celles de la sauvegarde de compte existante : ce classement est communautaire,
pas une validation autoritaire de la simulation côté serveur. Ne pas l’utiliser pour attribuer
argent ou récompenses sans validation supplémentaire des tentatives.
