import * as config from '../../config'
import { TileType } from '../types/types';
import { getRandomTileType, buildRows, getRandomMapTexture, getRandomObstacleTexture, getRandomWeapon } from '../utils/utils';
import { Weapon } from './weapon';

export class Tile {
    weapon: Weapon;
    type: TileType;
    constructor(type: TileType) {
        this.type = type;
    }
}

export class Row {
    tiles: Tile[]
    rowIndex: number;
    constructor(tiles: number, rowIndex: number) {
        this.tiles = this.createRow(tiles, rowIndex);
    }
    createRow(tiles: number, rowIndex: number): Tile[] {
        const row: Tile[] = [];
        const tilesArray = [...Array(tiles)];
        tilesArray.forEach((_tile, tileIndex) => {
            let type: TileType = 'empty';
            rowIndex === 0 || rowIndex === config.rows - 1 ? type = 'obstacle'
            : tileIndex === 0 || tileIndex === config.cols - 1 ? type = 'obstacle'
            : type = getRandomTileType();
            row.push(new Tile(type))
        });
        return row
    }
}

export class Map {
    rows: Row[]
    constructor(rows: Row[]) {
        this.rows = rows
    }
}

const mapRows = buildRows();
export const gameMap = new Map(mapRows);

const mapCanvas = document.getElementById('canvas-map') as HTMLCanvasElement;
const mapContext = mapCanvas.getContext('2d');
export const weaponsCanvas = document.getElementById('canvas-weapons') as HTMLCanvasElement;
export const weaponsContext = weaponsCanvas.getContext('2d');
export const possibleMovesCanvas = document.getElementById('canvas-possible-moves') as HTMLCanvasElement;
export const possibleMovesContext = possibleMovesCanvas.getContext('2d');
export const possibleAttacksCanvas = document.getElementById('canvas-possible-attacks') as HTMLCanvasElement;
export const possibleAttacksContext = possibleAttacksCanvas.getContext('2d');
export const animationsCanvas = document.getElementById('canvas-animations') as HTMLCanvasElement;
export const animationsContext = animationsCanvas.getContext('2d');

mapCanvas.width = config.tileSize * config.cols;
mapCanvas.height = config.tileSize * config.rows;
weaponsCanvas.width = config.tileSize * config.cols;
weaponsCanvas.height = config.tileSize * config.rows;
possibleMovesCanvas.width = config.tileSize * config.cols;
possibleMovesCanvas.height = config.tileSize * config.rows;
possibleAttacksCanvas.width = config.tileSize * config.cols;
possibleAttacksCanvas.height = config.tileSize * config.rows;
animationsCanvas.width = config.tileSize * config.cols;
animationsCanvas.height = config.tileSize * config.rows;

const renderMap = () => {
    mapContext.rect(0, 0, mapCanvas.width, mapCanvas.height);
    mapContext.fillStyle = "#000";
    [...Array(config.rows)].forEach((_row, rowIndex) => {
        [...Array(config.cols)].forEach((_col, colIndex) => {
            if (gameMap.rows[rowIndex].tiles[colIndex].type === 'obstacle') {
                const texture = getRandomObstacleTexture();
                texture.onload = () => {
                    mapContext.drawImage(texture, colIndex * config.tileSize, rowIndex * config.tileSize, texture.width, texture.height);
                }
            } else if (gameMap.rows[rowIndex].tiles[colIndex].type === 'empty') {
                const texture = getRandomMapTexture();
                texture.onload = () => {
                    mapContext.drawImage(texture, colIndex * config.tileSize, rowIndex * config.tileSize, texture.width, texture.height);
                }
            } else if (gameMap.rows[rowIndex].tiles[colIndex].type === 'weapon') {
                const mapTexture = getRandomMapTexture();
                mapTexture.onload = () => {
                    mapContext.drawImage(mapTexture, colIndex * config.tileSize, rowIndex * config.tileSize, mapTexture.width, mapTexture.height);
                    const weapon = getRandomWeapon();
                    const weaponTexture = new Image(config.tileSize, config.tileSize)
                    weaponTexture.src = weapon.skin;
                    weaponTexture.onload = () => {
                        weaponsContext.drawImage(weaponTexture, colIndex * config.tileSize + weaponTexture.width / 4, rowIndex * config.tileSize + weaponTexture.height / 4, weaponTexture.width / 2, weaponTexture.height / 2);
                        gameMap.rows[rowIndex].tiles[colIndex].weapon = weapon;
                    }
                }
            }
        })
    })
}

export default renderMap;