# Pixel War

#### Par Adrien Jacquier Bret

#### Technologies utilisées

- HTML5 Canvas
- Typescript ES5
- Webpack
- Yarn
- jQuery


### Utilisation

###### Pour compiler le projet en mode "prod" (depuis la racine du projet) :

`yarn install && yarn build` 
Puis, ouvrir le fichier "index.html" situé dans le répertoir "/dist/index.html".

Pour compiler le projet en mode "dev" (avec serveur de développement Webpack et hot-reload) : `yarn install && yarn dev`

### Guide de jeu

Pixel War est un jeu tour par tour dans lequel deux joueurs s'affrontent, jusqu'à ce que l'un d'entre eux perde l'intégralité de ses points de vie (100).

À chaque génération de la carte (Cmd + R ou Ctrl + R pour recharger la page), chaque joueur se voit assigner une classe (Archer, Guerrier ou Sorcier), une arme de départ qui dépend de cette classe, ou un kit de sortilèges dans le cas de la classe Sorcier. Un certain nombre d'armes sont également générées sur la carte, et peuvent être ramassées par les joueurs en se déplacant sur une case comportant une arme. Lorsqu'il ramasse une arme, le joueur dépose celle dont il disposait déjà sur la case correspondante.

Chaque arme et chaque sort dispose d'une portée et de dégâts différents.
Un Archer ne peut ramasser que des armes de type "À distance", un Guerrier ne peut ramasser que des armes de type "Corps à corps", tandis qu'un Sorcier ne peut pas ramasser d'arme.

Si un joueur est Sorcier, il choisit le sort qu'il souhaite utiliser dans à l'aide du menu déroulant situé en haut de la page.
Les caractéristiques de son sort sont alors affichées au dessous du menu déroulant, de même que pour toute autre arme du jeu.

Lors de son tour, le joueur peut se déplacer en croix sur un nombre limité de cases (symbolisées par une teinte verte) à l'aides des touches "Z/Q/S/D" du clavier, et peut terminer son tour de trois manières différentes :

- Il peut appuyer sur la touche "Entrée" ou effectuer un clic sur le boutton "Passer" et ainsi passer son tour sans aucune autre action supplémentaire.
- Il peut appuyer sur la touche "R" et ainsi passer son tour en mode "défense", ce qui le protègera d'une attaque ultérieure à hauteur de la moitié des points de dégâts infligés par l'arme de son adversaire. Il conserve le mode "défense" jusqu'à sa prochaine attaque. Le mode "défense" est symbolisé par une teinte bleutée du joueur.
- Il peut appuyer sur la touch "Espace" dans le cas où un adversaire se trouve dans la zone de portée de son arme ou de son sort (symbolisée par des cercles rouges). Dans ce cas, il attaque son adversaire et lui inflige un nombre de dégâts correspondant aux caractéristiques de son arme, ou à la moitié de celles-ci dans le cas où son adversaire est en mode "défense".

Lors de l'appui sur une de ces trois touches, le joueur passe son tour et c'est au joueur suivant d'effectuer une action.

Au début de la partie, chaque joueur est automatiquement en posture de défense.

Les cases teintées par une couleur orange symbolisent des obstacles, le joueur ne peut ni se déplacer sur celles-ci, ni attaquer au travers de celles-ci.

Il est possible de modifier le nom des joueurs ainsi que d'affiner certains réglages du jeu en modifiant le fichier de configuration "config.js" situé à la racine du projet, de même que de modifier les dégâts et/ou la portée des armes/sorts en modifiant les valeurs situées respectivement dans les fichiers "weapons.ts" et "spells.ts".

De manière très aléatoire mais néanmoins extrêmement rare, un joueur peut débuter la partie entouré d'obstacle et ainsi sans possibilité de se mouvoir, d'autant plus si le paramètre 'obstacleRandomness' du fichier de configuration a une valeur élevée. Il suffit alors de recharger la page internet pour générer une nouvelle partie.

Bonne partie !