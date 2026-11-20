# Robot de la Radio Je suis KCCiste → YouTube

Un petit programme qui tourne jour et nuit sur un serveur loué (Hetzner, environ
4 à 5 € par mois). Il regarde la grille de la radio du site toutes les 20 secondes :

| Sur le site                                              | Sur YouTube                                         |
|----------------------------------------------------------|-----------------------------------------------------|
| Une émission programmée commence (/admin/radio)          | Le robot l'envoie en direct, du début à la fin      |
| Direct avec un flux externe (Zeno.fm…) « Passer en direct » | Le robot le relaie                               |
| Direct depuis l'antenne du site (/admin/radio/antenne)   | C'est l'antenne qui envoie (clé collée dans l'antenne) ; le robot se retire |
| Rien à l'antenne                                         | Rien (YouTube termine le direct tout seul)          |

L'image envoyée : fond bleu nuit, logo KCC, « EN DIRECT », titre et sujet de
l'émission, onde du son, « Radio Je suis KCCiste · jesuiskcciste.com/radio ».

La clé de stream n'est **jamais** dans ce dépôt : elle est seulement sur le serveur,
dans `/etc/robot-radio.env` (lisible par l'administrateur du serveur seulement).

## Installer (sans rien taper dans un terminal)

1. YouTube Studio › **Passer au direct** › onglet **Flux** : copier la clé de stream.
   Dans les paramètres du flux, activer **Démarrage automatique** et **Arrêt automatique**.
2. https://console.hetzner.cloud › **New project** › **Add Server** :
   - **Location** : Falkenstein ou Nuremberg ;
   - **Image** : Ubuntu 24.04 ;
   - **Type** : Shared vCPU, le moins cher (2 vCPU) ;
   - **Networking** : laisser IPv4 + IPv6 ;
   - **Cloud config** : coller le texte ci-dessous en remplaçant `VOTRE-CLE` ;
   - **Create & Buy now**.

```yaml
#cloud-config
runcmd:
  - curl -fsSL https://raw.githubusercontent.com/reaganmbumba/jesuiskcciste.com/main/robot-radio/installer.sh | YOUTUBE_KEY=VOTRE-CLE sh
```

Le serveur s'installe tout seul en 3 à 5 minutes. C'est fini : programmez une émission
sur le site, elle part sur YouTube à l'heure.

## Commandes sur le serveur (Hetzner › serveur › **Console** `>_`)

```
robot-radio etat              # ce que fait le robot
robot-radio cle NOUVELLE-CLE  # changer la clé YouTube
robot-radio mise-a-jour       # dernière version depuis GitHub
robot-radio redemarrer
robot-radio arreter
```

## Essais (développeurs)

```
node --test robot-radio/essais.mjs
ROBOT_SETTINGS_URL=http://localhost:8099/ ROBOT_TEST_OUTPUT=/tmp/sortie.flv node robot-radio/robot.mjs
```

`ROBOT_SETTINGS_URL` rend le réglage du site (JSON `[{ "value": { "radio": … } }]`),
`ROBOT_TEST_OUTPUT` remplace YouTube par un fichier. Autres destinations RTMP
(Facebook…) : variable `EXTRA_RTMP` dans `/etc/robot-radio.env`.
