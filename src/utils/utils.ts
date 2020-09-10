import * as config from '../../config';
import { differentTiles, TileType } from '../types/types';
import { gameMap, Row, Tile } from '../ts/map';
import { Weapon, weaponsList } from '../ts/weapon';
import tile1 from '../../assets/img/maps/tile-1.png'
import obstacle1 from '../../assets/img/maps/obstacles/obstacle-1.png'
import obstacle2 from '../../assets/img/maps/obstacles/obstacle-2.png'
import obstacle3 from '../../assets/img/maps/obstacles/obstacle-3.png'
import obstacle4 from '../../assets/img/maps/obstacles/obstacle-4.png'
import WarriorImg from '../../assets/img/skins/warrior.png'
import WizardImg from '../../assets/img/skins/wizard.png'
import ArcherImg from '../../assets/img/skins/archer.png'
import { Archer, Warrior, Wizard } from '../ts/class';


export const getRandomTileType = (): TileType => {
    const typesWeight = [4, config.random.obstacleRandomness, config.random.weaponRandomness, 0];
    const totalWeight = eval(typesWeight.join('+'));
    const weighedTypes = new Array();
    let currentType = 0;

    while (currentType < differentTiles.length) {
        for (var i = 0; i < typesWeight[currentType]; i++) {
            weighedTypes[weighedTypes.length] = differentTiles[currentType];
        }
        currentType++
    }

    return weighedTypes[Math.floor(Math.random() * totalWeight)];
}

export const getTileAdjacentTypes = (tile: { row: number; col: number; }): TileType[] => {
    const leftTileType = gameMap.rows[tile.row].tiles[tile.col - 1].type;
    const rightTileType = gameMap.rows[tile.row].tiles[tile.col + 1].type;
    const upTileType = gameMap.rows[tile.row - 1].tiles[tile.col].type;
    const downTileType = gameMap.rows[tile.row + 1].tiles[tile.col].type;

    return [leftTileType, rightTileType, upTileType, downTileType];
}

export const getRandomTilePosition = (strict?: boolean, playerStrict?: boolean) => {
    const randomRow = Math.floor(Math.random() * (config.rows - 2)) + 2;
    const randomCol = Math.floor(Math.random() * (config.cols - 2)) + 2;

    const emptyTiles: {
        row: number,
        col: number;
    }[] = [];

    [...Array(config.rows)].forEach((_row, rowIndex) => {
        [...Array(config.cols)].forEach((_col, colIndex) => {
            if (gameMap.rows[rowIndex].tiles[colIndex].type === 'empty') {
                emptyTiles.push({
                    row: rowIndex,
                    col: colIndex,
                });
            }
        });
    });

    if (strict) {
        const randomEmptyTile = emptyTiles[
            Math.floor(
                Math.random()
                * (emptyTiles.indexOf(emptyTiles[emptyTiles.length - 1])
                - 1
                + 1
            ))
        ];
        if (playerStrict) {
            const playerOnAdjacentTile = getTileAdjacentTypes({ row: randomEmptyTile.row, col: randomEmptyTile.col }).includes('player');
            return playerOnAdjacentTile ? getRandomTilePosition(true, true) : { row: randomEmptyTile.row, col: randomEmptyTile.col };
        }
        return randomEmptyTile;
    } else {
        return {
            row: randomRow,
            col: randomCol
        }
    }
}

export const buildRows = (): Row[] => {
    const rows: Row[] = [];
    [...Array(config.rows)].forEach((_numberOfRows, index) => {
        rows.push(new Row(config.cols, index));
    })

    const weapons = [];
    
    rows.forEach(row => {
        row.tiles.forEach(tile => {
            if (tile.type === 'weapon') {
                weapons.push(tile)
            }
        })
    })

    if ((weapons.length > config.maxWeaponsGeneration) && (weapons.length > config.minWeaponsGeneration)) {
        return buildRows()
    } else {
        return rows
    }
}

export const getRandomMapTexture = (): HTMLImageElement => {
    const mapTiles = [tile1]
    const mapSelection = mapTiles[Math.ceil(Math.random() * (mapTiles.indexOf(mapTiles[mapTiles.length - 1]) - mapTiles.indexOf(mapTiles[0])) - mapTiles.indexOf(mapTiles[0]))]
    const texture = new Image(config.tileSize, config.tileSize);
    texture.src = mapSelection;
    return texture;
}

export const getRandomObstacleTexture = (): HTMLImageElement => {
    const mapObstacles = [obstacle1, obstacle2, obstacle3, obstacle4]
    const obstacleSelection = mapObstacles[Math.ceil(Math.random() * (mapObstacles.indexOf(mapObstacles[mapObstacles.length - 1]) - mapObstacles.indexOf(mapObstacles[0])) - mapObstacles.indexOf(mapObstacles[0]))]
    const texture = new Image(config.tileSize, config.tileSize);
    texture.src = obstacleSelection;
    return texture;
}

const weaponsGenerationHistoric = [];
let weaponsGenerationCount = 0;

export const getRandomWeapon = (): Weapon => {
    weaponsGenerationCount++
    const weaponsIds: number[] = []
    weaponsList.forEach(weapon => {
        weaponsIds.push(weapon.id)
    })
    const weaponRandomSelection = weaponsList[Math.ceil(Math.random() * (weaponsList.indexOf(weaponsList[weaponsList.length - 1]) - weaponsList.indexOf(weaponsList[0])) - weaponsList.indexOf(weaponsList[0]))];
    weaponsGenerationHistoric.push(weaponRandomSelection.type);
    if ((weaponsGenerationCount > config.maxWeaponsGeneration - 3) && !weaponsGenerationHistoric.includes('Bow')) {
        return weaponsList[1];
    }
    if ((weaponsGenerationCount > config.maxWeaponsGeneration - 3) && (!weaponsGenerationHistoric.includes('Axe') && !weaponsGenerationHistoric.includes('Sword') && !weaponsGenerationHistoric.includes('Dagger'))) {
        return weaponsList[0];
    }
    return weaponRandomSelection;
}

export const getRandomClass = () => {
    let classes = [
        new Warrior('Guerrier', WarriorImg),
        new Archer('Archer', ArcherImg),
        new Wizard('Sorcier', WizardImg),
    ]

    const randomClass = classes[
        Math.round(
            (Math.random() * (
                    classes.indexOf(classes[classes.length - 1])
                    - classes.indexOf(classes[0])
                )
                + classes.indexOf(classes[0])
            )
        )
    ]

    return randomClass
}