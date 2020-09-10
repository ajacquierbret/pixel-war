module.exports = {
    fps: 30,
    cols: 20,
    rows: 20,
    tileSize: 64,
    random: {
        obstacleRandomness: 1,
        weaponRandomness: 0.1,
    },
    players: {
        names: ['Joueur 1', 'Joueur 2'] // Must coincide with 'numberOfPlayers' parameter
    },
    playerRange: 3,
    maxWeaponsGeneration: 4,
    minWeaponsGeneration: 2,
    colors: {
        grid: 'transparent'
    },
}