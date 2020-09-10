import * as $ from 'jquery'
import { FallingStar, Vengeance, Weapon } from './weapon'
import { Warrior, Archer, Wizard } from './class'
import Spell, { Fury, Phantom, Cometfall, Doomshadow } from './spell'
import * as config from '../../config'
import { getRandomClass, getRandomTilePosition } from '../utils/utils'
import { animationsCanvas, animationsContext, gameMap, possibleAttacksCanvas, possibleAttacksContext, possibleMovesCanvas, possibleMovesContext, weaponsContext } from './map';
import { Direction, Range, Posture } from '../types/types';
import { Animation } from './animations'

export class Player {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    name: string;
    class: Warrior | Archer | Wizard;
    skin: HTMLImageElement;
    pv: number;
    positionY: number;
    positionX: number;
    oldWeapon: Weapon | null;
    actualWeapon: Weapon | null;
    spells: Spell[];
    myTurn: boolean;
    possibleMoves: {
        horizontal: {
            left: number;
            right: number;
        }[];
        vertical: {
            up: number;
            down: number;
        }[];
    };
    possibleAttacks: {
        horizontal: {
            left: number;
            right: number;
        }[];
        vertical: {
            up: number;
            down: number;
        }[];
    };
    moveMemory: {
        left: number,
        right: number,
        up: number,
        down: number,
    }
    angle: number;
    weaponOnActualTile: boolean;
    target: {
        row: number;
        col: number;
    }
    distanceFromEnnemyInTiles: number | 'obstacle';
    posture: Posture;
    selectedSpell: Spell;
    attackAnimation: Animation;
    constructor(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        name: string,
        playerClass: Warrior | Archer | Wizard,
        pv: number,
        positionY: number,
        positionX: number,
        actualWeapon: Weapon,
        spells: Spell[],
        myTurn: boolean
    ) {
        this.canvas = canvas
        this.context = context
        this.name = name
        this.class = playerClass
        this.skin = new Image(config.tileSize, config.tileSize)
        this.skin.src = this.class.skin
        this.skin.onload = () => this.gameEngine()
        this.pv = pv
        this.positionY = positionY
        this.positionX = positionX
        this.oldWeapon = null
        this.actualWeapon = actualWeapon
        this.spells = spells
        this.myTurn = myTurn
        this.weaponOnActualTile = false
        this.moveMemory = {
            left: 0,
            right: 0,
            up: 0,
            down: 0,
        }
        this.posture = 'defending'
        this.distanceFromEnnemyInTiles = null
        this.selectedSpell = this.class.name === 'Sorcier' ? Fury : null
        this.setPossibleMoves()
        this.canvas.width = config.tileSize * config.cols
        this.canvas.height = config.tileSize * config.rows
    }

    getSelectedSpell() {
        this.selectedSpell = this.spells.find(spell => spell.id.toString() === $('#spells').children('option:selected').val().toString())
    }

    getRange(inValues: boolean): Range | {
        min: number;
        max: number;
    } {
        switch(this.class.name) {
            case 'Guerrier':
                if (inValues) {
                    return {
                        min: this.actualWeapon.characteristics.minRange,
                        max: this.actualWeapon.characteristics.maxRange
                    }
                }
                return 'close';
            case 'Sorcier':
                if (inValues) {
                    return {
                        min: this.selectedSpell.characteristics.minRange,
                        max: this.selectedSpell.characteristics.maxRange
                    }
                }
                return 'distance';
            case 'Archer':
                if (inValues) {
                    return {
                        min: this.actualWeapon.characteristics.minRange,
                        max: this.actualWeapon.characteristics.maxRange
                    }
                }
                return 'distance';
        }
    }

    displayWeaponOrSpellInfo() {
        this.spells
        ? $('#weapon-characteristics').html(`DEGATS : ${this.selectedSpell.characteristics.damages} <br/>PORTEE : ${this.selectedSpell.characteristics.minRange}–> ${this.selectedSpell.characteristics.maxRange}`)
        : $('#weapon-characteristics').html(`DEGATS : ${this.actualWeapon.characteristics.damages} <br/>PORTEE : ${this.actualWeapon.characteristics.minRange}–> ${this.actualWeapon.characteristics.maxRange}`)
    }

    displayInfo() {
        $('#player').html(this.name);
            $('#weapon-skin').html(`<img width="32" src="${this.actualWeapon !== null ? this.actualWeapon.skin : ''}" />`)
        if (this.class.name !== 'Sorcier') {
            $('#weapon-name').html(this.actualWeapon !== null ? this.actualWeapon.name : "Pas d'arme");
        } else {
            $('#weapon-name').html('');
            $('#weapon-name').html('<select id="spells" class="spell-select" style="font-family: \'Pixel\' !important"></select>')
            this.spells ? this.spells.forEach(spell => $('#spells').append('<option value="' + spell.id + '">' + spell.name + '</option>' + '</br>')) : null;
        }
        this.displayWeaponOrSpellInfo()
        $('#class-name').html(this.class.name);
        $('#class-skin').html(`<img width="32" src="${this.class.skin}" />`);
        $('#pv').html(this.pv.toString());
    }

    gameEngine() {
        const interval = setInterval(() => {
            if (this.myTurn) {
                this.update();
                this.draw();
            } else {
                clearInterval(interval);
                this.draw();
            }
        }, 1000 / config.fps);
    }

    update() {
        document.onkeydown = (event) => {
            switch (event.code) {
                case 'KeyA':
                    this.angle = 90
                    this.move('left')
                    break
                case 'KeyW':
                    this.angle = 180
                    this.move('up')
                    break
                case 'KeyD':
                    this.angle = - 90
                    this.move('right')
                    break
                case 'KeyS':
                    this.angle = 0
                    this.move('down')
                    break
                case 'Enter':
                    handleTurn()
                    break
                case 'Space':
                    event.preventDefault()
                    this.attack()
                    break
                case 'KeyR':
                    this.defend()
                    break
            }
        }
        if (this.class.name === 'Sorcier') {
            this.getSelectedSpell()
            this.displayWeaponOrSpellInfo()
        }
        this.setPossibleAttacks()
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const x = this.positionX + config.tileSize / 2;
        const y = this.positionY + config.tileSize / 2;
        const width = this.skin.width;
        const height = this.skin.height;
        this.context.translate(x, y);
        this.context.rotate(this.angle * Math.PI / 180);
        this.context.drawImage(
            this.skin,
            -width / 2,
            -height / 2,
            this.skin.width,
            this.skin.height,
        );
        this.context.rotate(-(this.angle * Math.PI / 180));
        this.context.translate(-x, -y)
        if (this.posture === 'defending') {
            this.context.fillStyle = 'rgba(52, 152, 219, 0.7)'
            this.context.globalCompositeOperation = "color"
            this.context.fillRect(x - config.tileSize / 2, y - config.tileSize / 2, this.skin.width, this.skin.height)
            this.context.globalCompositeOperation = "source-over"
            this.context.globalCompositeOperation = 'destination-in'
            this.context.translate(x, y);
            this.context.rotate(this.angle * Math.PI / 180);
            this.context.drawImage(
                this.skin,
                -width / 2,
                -height / 2,
                this.skin.width,
                this.skin.height,
            );
            this.context.rotate(-(this.angle * Math.PI / 180));
            this.context.translate(-x, -y)
            this.context.globalCompositeOperation = "source-over"
        }
    }

    tileIsValid({col, row}: { col: number, row: number }) {
        return gameMap.rows[row] !== undefined && gameMap.rows[row].tiles[col] !== undefined
    }

    getTileType({
        col,
        row,
    }: { col: number, row: number }) {
        if (this.tileIsValid({ col, row })) {
            return gameMap.rows[row].tiles[col].type
        } else {
            return null
        }
    }

    getWeaponType({
        col,
        row,
    }: { col: number, row: number }) {
        if (this.tileIsValid({ col, row })) {
            return gameMap.rows[row].tiles[col].weapon ? gameMap.rows[row].tiles[col].weapon.type : null
        } else {
            return null;
        }
    }

    isActualTileWeaponAuthorized() {
        switch (this.getWeaponType({
            col: this.positionX / config.tileSize,
            row: this.positionY / config.tileSize,
        })) {
            case 'Axe':
                return this.class.authorizedWeapons === 'hand to hand weapons'
            case 'Dagger':
                return this.class.authorizedWeapons === 'hand to hand weapons'
            case 'Sword':
                return this.class.authorizedWeapons === 'hand to hand weapons'
            case 'Bow':
                return this.class.authorizedWeapons === 'ranged weapons'
            default:
                return false
        }
    }

    move(direction: Direction) {
        switch(direction) {
            case 'left':
                const leftTileType = this.getTileType({
                    col: (this.positionX - config.tileSize) / config.tileSize,
                    row: (this.positionY / config.tileSize),
                })
                const moveLeft = () => {
                    if (this.moveMemory.up === 0 && this.moveMemory.down === 0 && this.moveMemory.left < config.playerRange) {
                        let nextLeftTile = this.possibleMoves.horizontal[0].left;
                        if (this.moveMemory.right === 0) {
                            this.moveMemory.left += 1
                            nextLeftTile = this.possibleMoves.horizontal[this.moveMemory.left].left;
                        } else if (this.moveMemory.right > 1) {
                            this.moveMemory.right -= 1
                            nextLeftTile = this.possibleMoves.horizontal[this.moveMemory.right].right;
                        } else {
                            this.moveMemory.right -= 1
                            nextLeftTile = this.possibleMoves.horizontal[0].left;
                        }
                        this.positionX = nextLeftTile;
                        if (this.weaponOnActualTile === false) {
                            gameMap.rows[this.positionY / config.tileSize].tiles[(this.positionX + config.tileSize) / config.tileSize].type = 'empty';
                        } else if (this.weaponOnActualTile === true) {
                            gameMap.rows[this.positionY / config.tileSize].tiles[(this.positionX + config.tileSize) / config.tileSize].type = 'weapon';
                        }
                        gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].type = 'player';
                    }
                }
                if (leftTileType === 'empty') {
                    moveLeft()
                    this.weaponOnActualTile = false
                } else if (leftTileType === 'weapon') {
                    moveLeft()
                    if (this.isActualTileWeaponAuthorized()) {
                        this.oldWeapon = this.actualWeapon;
                        this.actualWeapon = gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon;
                        this.displayInfo()
                        weaponsContext.clearRect(this.positionX, this.positionY, config.tileSize, config.tileSize);
                        if (this.oldWeapon !== null) {
                            const weaponToThrow = new Image(config.tileSize / 2, config.tileSize / 2)
                            weaponToThrow.src = this.oldWeapon.skin
                            weaponToThrow.onload = () => {
                                weaponsContext.drawImage(weaponToThrow, this.positionX + weaponToThrow.width / 2, this.positionY + weaponToThrow.height / 2, weaponToThrow.width, weaponToThrow.height)
                                gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon = this.oldWeapon;
                                this.weaponOnActualTile = true
                                this.displayInfo()
                            }
                        }
                    } else {
                        this.weaponOnActualTile = true;
                    }
                }
            break;
            case 'right':
                const rightTileType = this.getTileType({
                    col: (this.positionX + config.tileSize) / config.tileSize,
                    row: (this.positionY / config.tileSize),
                })
                const moveRight = () => {
                    if (this.moveMemory.up === 0 && this.moveMemory.down === 0 && this.moveMemory.right < config.playerRange) {
                        let nextTile = this.possibleMoves.horizontal[0].right
                        if (this.moveMemory.left === 0) {
                            this.moveMemory.right += 1
                            nextTile = this.possibleMoves.horizontal[this.moveMemory.right].right
                        } else if (this.moveMemory.left > 1) {
                            this.moveMemory.left -= 1
                            nextTile = this.possibleMoves.horizontal[this.moveMemory.left].left
                        } else {
                            this.moveMemory.left -= 1
                            nextTile = this.possibleMoves.horizontal[0].right
                        }
                        this.positionX = nextTile;
                        if (this.weaponOnActualTile === false) {
                            gameMap.rows[this.positionY / config.tileSize].tiles[(this.positionX - config.tileSize) / config.tileSize].type = 'empty';
                        } else if (this.weaponOnActualTile === true) {
                            gameMap.rows[this.positionY / config.tileSize].tiles[(this.positionX - config.tileSize) / config.tileSize].type = 'weapon';
                        }
                        gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].type = 'player';
                    }
                }
                if (rightTileType === 'empty') {
                    moveRight()
                    this.weaponOnActualTile = false
                } else if (rightTileType === 'weapon') {
                    moveRight()
                    if (this.isActualTileWeaponAuthorized()) {
                        this.oldWeapon = this.actualWeapon;
                        this.actualWeapon = gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon;
                        this.displayInfo()
                        weaponsContext.clearRect(this.positionX, this.positionY, config.tileSize, config.tileSize);
                        if (this.oldWeapon !== null) {
                            const weaponToThrow = new Image(config.tileSize / 2, config.tileSize / 2)
                            weaponToThrow.src = this.oldWeapon.skin
                            weaponToThrow.onload = () => {
                                weaponsContext.drawImage(weaponToThrow, this.positionX + weaponToThrow.width / 2, this.positionY + weaponToThrow.height / 2, weaponToThrow.width, weaponToThrow.height)
                                gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon = this.oldWeapon;
                                this.weaponOnActualTile = true
                                this.displayInfo()
                            }
                        }
                    } else {
                        this.weaponOnActualTile = true
                    }
                }
            break;
            case 'up':
                const upTileType = this.getTileType({
                    col: (this.positionX / config.tileSize),
                    row: (this.positionY - config.tileSize) / config.tileSize,
                })
                const moveUp = () => {
                    if (this.moveMemory.left === 0 && this.moveMemory.right === 0 && this.moveMemory.up < config.playerRange) {
                        let nextTile = this.possibleMoves.vertical[0].up
                        if (this.moveMemory.down === 0) {
                            this.moveMemory.up += 1
                            nextTile = this.possibleMoves.vertical[this.moveMemory.up].up
                        } else if (this.moveMemory.down > 1) {
                            this.moveMemory.down -= 1
                            nextTile = this.possibleMoves.vertical[this.moveMemory.down].down
                        } else {
                            this.moveMemory.down -= 1
                            nextTile = this.possibleMoves.vertical[0].up
                        }
                        this.positionY = nextTile;
                        if (this.weaponOnActualTile === false) {
                            gameMap.rows[(this.positionY + config.tileSize) / config.tileSize].tiles[this.positionX / config.tileSize].type = 'empty';
                        } else if (this.weaponOnActualTile === true) {
                            gameMap.rows[(this.positionY + config.tileSize) / config.tileSize].tiles[this.positionX / config.tileSize].type = 'weapon';
                        }
                        gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].type = 'player';
                    }
                }
                if (upTileType === 'empty') {
                    moveUp()
                    this.weaponOnActualTile = false
                } else if (upTileType === 'weapon') {
                    moveUp()
                    if (this.isActualTileWeaponAuthorized()) {
                        this.oldWeapon = this.actualWeapon;
                        this.actualWeapon = gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon;
                        this.displayInfo()
                        weaponsContext.clearRect(this.positionX, this.positionY, config.tileSize, config.tileSize);
                        if (this.oldWeapon !== null) {
                            const weaponToThrow = new Image(config.tileSize / 2, config.tileSize / 2)
                            weaponToThrow.src = this.oldWeapon.skin
                            weaponToThrow.onload = () => {
                                weaponsContext.drawImage(weaponToThrow, this.positionX + weaponToThrow.width / 2, this.positionY + weaponToThrow.height / 2, weaponToThrow.width, weaponToThrow.height)
                                gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon = this.oldWeapon;
                                this.weaponOnActualTile = true
                                this.displayInfo()
                            }
                        }
                    } else {
                        this.weaponOnActualTile = true
                    }
                }
            break;
            case 'down':
                const downTileType = this.getTileType({
                    col: (this.positionX / config.tileSize),
                    row: (this.positionY + config.tileSize) / config.tileSize,
                })
                const moveDown = () => {
                    if (this.moveMemory.left === 0 && this.moveMemory.right === 0 && this.moveMemory.down < config.playerRange) {
                        let nextTile = this.possibleMoves.vertical[0].down
                        if (this.moveMemory.up === 0) {
                            this.moveMemory.down += 1
                            nextTile = this.possibleMoves.vertical[this.moveMemory.down].down
                        } else if (this.moveMemory.up > 1) {
                            this.moveMemory.up -= 1
                            nextTile = this.possibleMoves.vertical[this.moveMemory.up].up
                        } else {
                            this.moveMemory.up -= 1
                            nextTile = this.possibleMoves.vertical[0].down
                        }
                        this.positionY = nextTile;
                        if (this.weaponOnActualTile === false) {
                            gameMap.rows[(this.positionY - config.tileSize) / config.tileSize].tiles[this.positionX / config.tileSize].type = 'empty';
                        } else if (this.weaponOnActualTile === true) {
                            gameMap.rows[(this.positionY - config.tileSize) / config.tileSize].tiles[this.positionX / config.tileSize].type = 'weapon';
                        }  
                        gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].type = 'player';
                    }
                }
                if (downTileType === 'empty') {
                    moveDown()
                    this.weaponOnActualTile = false
                } else if (downTileType === 'weapon') {
                    moveDown()
                    if (this.isActualTileWeaponAuthorized()) {
                        this.oldWeapon = this.actualWeapon;
                        this.actualWeapon = gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon;
                        this.displayInfo()
                        weaponsContext.clearRect(this.positionX, this.positionY, config.tileSize, config.tileSize);
                        if (this.oldWeapon !== null) {
                            const weaponToThrow = new Image(config.tileSize / 2, config.tileSize / 2)
                            weaponToThrow.src = this.oldWeapon.skin
                            weaponToThrow.onload = () => {
                                weaponsContext.drawImage(weaponToThrow, this.positionX + weaponToThrow.width / 2, this.positionY + weaponToThrow.height / 2, weaponToThrow.width, weaponToThrow.height);
                                gameMap.rows[this.positionY / config.tileSize].tiles[this.positionX / config.tileSize].weapon = this.oldWeapon;
                                this.weaponOnActualTile = true
                                this.displayInfo()
                            };
                        }
                    } else {
                        this.weaponOnActualTile = true
                    }
                }
            break;
        }
    }

    highlightRange(index: number) {
        if (this.class.name === 'Sorcier') {
            if (index <= this.selectedSpell.characteristics.maxRange && index >= this.selectedSpell.characteristics.minRange) {
                possibleAttacksContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
            } else {
                possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
            }
        } else {
            if (index <= this.actualWeapon.characteristics.maxRange && index >= this.actualWeapon.characteristics.minRange) {
                possibleAttacksContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
            } else {
                possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
            }
        }
    }
    
    setPossibleMoves() {
        const range = [...Array(config.playerRange)];

        this.possibleMoves = {
            horizontal: [{
                left: this.positionX,
                right: this.positionX,
            }],
            vertical: [{
                up: this.positionY,
                down: this.positionY,
            }],
        };

        this.moveMemory = {
            left: 0,
            right: 0,
            up: 0,
            down: 0,
        }

        range.forEach((_el, index) => {
            index += 1
            this.possibleMoves.horizontal.push({
                left: this.positionX - config.tileSize * index,
                right: this.positionX + config.tileSize * index,
            });
            this.possibleMoves.vertical.push({
                up: this.positionY - config.tileSize * index,
                down: this.positionY + config.tileSize * index,
            });
        })

        if (this.myTurn) {
            possibleMovesContext.clearRect(0, 0, possibleMovesCanvas.width, possibleMovesCanvas.height)
            this.possibleMoves.horizontal.forEach((move, index) => {
                if (index !== 0) {
                    const leftTileType = this.getTileType({
                        col: move.left / config.tileSize,
                        row: this.positionY / config.tileSize,
                    })
                    if ((leftTileType === 'empty' || leftTileType === 'weapon') && leftTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(46, 204, 113, 0.4)'
                    } else if (leftTileType === 'player') {
                        possibleMovesContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
                    } else if (leftTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(255, 159, 67, 0.6)'
                    }
                    possibleMovesContext.rect(move.left, this.positionY, config.tileSize, config.tileSize);
                    possibleMovesContext.fillRect(move.left, this.positionY, config.tileSize, config.tileSize);
                    const rightTileType = this.getTileType({
                        col: move.right / config.tileSize,
                        row: this.positionY / config.tileSize,
                    })
                    if ((rightTileType === 'empty' || rightTileType === 'weapon') && rightTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(46, 204, 113, 0.4)'
                    } else if (rightTileType === 'player') {
                        possibleMovesContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
                    } else {
                        possibleMovesContext.fillStyle = 'rgba(255, 159, 67, 0.6)'
                    }
                    possibleMovesContext.rect(move.right, this.positionY, config.tileSize, config.tileSize)
                    possibleMovesContext.fillRect(move.right, this.positionY, config.tileSize, config.tileSize)
                }
            })
            this.possibleMoves.vertical.forEach((move, index) => {
                if (index !== 0) {
                    const upTileType = this.getTileType({
                        col: this.positionX / config.tileSize,
                        row: move.up / config.tileSize,
                    })
                    if ((upTileType === 'empty' || upTileType === 'weapon') && upTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(46, 204, 113, 0.4)'
                    } else if (upTileType === 'player') {
                        possibleMovesContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
                    } else if (upTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(255, 159, 67, 0.6)'
                    }
                    possibleMovesContext.rect(this.positionX, move.up, config.tileSize, config.tileSize);
                    possibleMovesContext.fillRect(this.positionX, move.up, config.tileSize, config.tileSize);
                    const downTileType = this.getTileType({
                        col: this.positionX / config.tileSize,
                        row: move.down / config.tileSize,
                    })
                    if ((downTileType === 'empty' || downTileType === 'weapon') && downTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(46, 204, 113, 0.4)'
                    } else if (downTileType === 'player') {
                        possibleMovesContext.fillStyle = 'rgba(231, 76, 60, 0.6)'
                    } else if (downTileType !== null) {
                        possibleMovesContext.fillStyle = 'rgba(255, 159, 67, 0.6)'
                    }
                    possibleMovesContext.rect(this.positionX, move.down, config.tileSize, config.tileSize);
                    possibleMovesContext.fillRect(this.positionX, move.down, config.tileSize, config.tileSize);
                }
            })
        }
    }

    setPossibleAttacks() {
        const playerRange = this.getRange(true) as {
            min: number;
            max: number;
        };
        const range = [...Array(playerRange.max)];

        this.possibleAttacks = {
            horizontal: [{
                left: this.positionX,
                right: this.positionX,
            }],
            vertical: [{
                up: this.positionY,
                down: this.positionY,
            }],
        };

        range.forEach((_el, index) => {
            index += 1
            this.possibleAttacks.horizontal.push({
                left: this.positionX - config.tileSize * index,
                right: this.positionX + config.tileSize * index,
            });
            this.possibleAttacks.vertical.push({
                up: this.positionY - config.tileSize * index,
                down: this.positionY + config.tileSize * index,
            });
        })

        let obstacleOnTheWay = {
            left: false,
            right: false,
            up: false,
            down: false,
        }

        if (this.myTurn) {
            possibleAttacksContext.clearRect(0, 0, possibleAttacksCanvas.width, possibleAttacksCanvas.height)
            this.distanceFromEnnemyInTiles = null
            this.possibleAttacks.horizontal.forEach((move, index) => {
                    if (index !== 0) {
                        const leftTileType = this.getTileType({
                            col: move.left / config.tileSize,
                            row: this.positionY / config.tileSize,
                        })
                        const rightTileType = this.getTileType({
                            col: move.right / config.tileSize,
                            row: this.positionY / config.tileSize,
                        })
                        if ((leftTileType === 'empty' || leftTileType === 'weapon') && leftTileType !== null) {
                            this.highlightRange(index)
                        } else if (leftTileType === 'player') {
                            this.target = {
                                col: move.left,
                                row: this.positionY,
                            }
                            if (obstacleOnTheWay.left) {
                                this.distanceFromEnnemyInTiles = 'obstacle'
                            } else {
                                this.distanceFromEnnemyInTiles = index
                                this.highlightRange(index)
                            }
                        } else if (leftTileType !== null && leftTileType === 'obstacle') {
                            obstacleOnTheWay.left = true
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        } else if (leftTileType !== null && leftTileType !== 'obstacle') {
                            this.highlightRange(index)
                        }
                        if (obstacleOnTheWay.left) {
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        }
                        possibleAttacksContext.beginPath()
                        possibleAttacksContext.arc(move.left + config.tileSize / 2, this.positionY + config.tileSize / 2, config.tileSize / 4, 0, 2 * Math.PI);
                        possibleAttacksContext.fill()
                        if ((rightTileType === 'empty' || rightTileType === 'weapon') && rightTileType !== null) {
                            this.highlightRange(index)
                        } else if (rightTileType === 'player') {
                            this.target = {
                                col: move.right,
                                row: this.positionY
                            }
                            if (obstacleOnTheWay.right) {
                                this.distanceFromEnnemyInTiles = 'obstacle'
                            } else {
                                this.distanceFromEnnemyInTiles = index
                                this.highlightRange(index)
                            }
                        } else if (rightTileType !== null && rightTileType === 'obstacle') {
                            obstacleOnTheWay.right = true
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        } else if (rightTileType !== null && rightTileType !== 'obstacle') {
                            this.highlightRange(index)
                        }
                        if (obstacleOnTheWay.right) {
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        }
                        possibleAttacksContext.beginPath()
                        possibleAttacksContext.arc(move.right + config.tileSize / 2, this.positionY + config.tileSize / 2, config.tileSize / 4, 0, 2 * Math.PI);
                        possibleAttacksContext.fill()
                    }
                })
                this.possibleAttacks.vertical.forEach((move, index) => {
                    if (index !== 0) {
                        const upTileType = this.getTileType({
                            col: this.positionX / config.tileSize,
                            row: move.up / config.tileSize,
                        })
                        const downTileType = this.getTileType({
                            col: this.positionX / config.tileSize,
                            row: move.down / config.tileSize,
                        })
                        if ((upTileType === 'empty' || upTileType === 'weapon') && upTileType !== null) {
                            this.highlightRange(index)
                        } else if (upTileType === 'player') {
                            this.target = {
                                col: this.positionX,
                                row: move.up
                            }
                            if (obstacleOnTheWay.up) {
                                this.distanceFromEnnemyInTiles = 'obstacle'
                            } else {
                                this.distanceFromEnnemyInTiles = index
                                this.highlightRange(index)
                            }
                        } else if (upTileType !== null && upTileType === 'obstacle') {
                            obstacleOnTheWay.up = true
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        } else if (upTileType !== null && upTileType !== 'obstacle') {
                            this.highlightRange(index)
                        }
                        if (obstacleOnTheWay.up) {
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        }
                        possibleAttacksContext.beginPath()
                        possibleAttacksContext.arc(this.positionX + config.tileSize / 2, move.up + config.tileSize / 2, config.tileSize / 4, 0, 2 * Math.PI);
                        possibleAttacksContext.fill();
                        if ((downTileType === 'empty' || downTileType === 'weapon') && downTileType !== null) {
                            this.highlightRange(index)
                        } else if (downTileType === 'player') {
                            this.target = {
                                col: this.positionX,
                                row: move.down,
                            }
                            if (obstacleOnTheWay.down) {
                                this.distanceFromEnnemyInTiles = 'obstacle'
                            } else {
                                this.distanceFromEnnemyInTiles = index
                                this.highlightRange(index)
                            }
                        } else if (downTileType !== null && downTileType === 'obstacle') {
                            obstacleOnTheWay.down = true
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        } else if (downTileType !== null && downTileType !== 'obstacle') {
                            this.highlightRange(index)
                        }
                        if (obstacleOnTheWay.down) {
                            possibleAttacksContext.fillStyle = 'rgba(155, 89, 182, 0)'
                        }
                        possibleAttacksContext.beginPath()
                        possibleAttacksContext.arc(this.positionX + config.tileSize / 2, move.down + config.tileSize / 2, config.tileSize / 4, 0, 2 * Math.PI);
                        possibleAttacksContext.fill();
                    }
                })
            }
    } 

    attackAnimationLoop() {
        let timesRun = 0;
        const interval = setInterval(() => {
            timesRun++;
            if (timesRun === this.attackAnimation.getNumberOfFrames()) {
                clearInterval(interval);
            }
            this.setPossibleAttacks();
            this.attackAnimation.update();
            animationsContext.clearRect(0, 0, animationsCanvas.width, animationsCanvas.height);
            if (this.class.name === 'Sorcier') {
                this.attackAnimation.draw(animationsContext, this.target.col - config.tileSize / 4, this.target.row - config.tileSize / 4);
            } else {
                this.attackAnimation.draw(animationsContext, this.target.col, this.target.row);
            }
            if (timesRun === this.attackAnimation.getNumberOfFrames()) {
                animationsContext.clearRect(0, 0, animationsCanvas.width, animationsCanvas.height);
            }
        }, 1000 / config.fps);
    }

    defend() {
        this.posture = 'defending'
        alert('Posture de défense activée pour le joueur : ' + this.name)
        handleTurn()
    }

    attack() {
        if (this.distanceFromEnnemyInTiles === 'obstacle') {
            alert('Vous ne pouvez pas attaquer à travers un obstacle')
        } else if (this.distanceFromEnnemyInTiles !== null) {
            const weapon = this.class.name === 'Sorcier' ? this.selectedSpell : this.actualWeapon
            this.attackAnimation = this.class.name === 'Sorcier' ? this.selectedSpell.animation : this.actualWeapon.animation
            if (this.distanceFromEnnemyInTiles <= weapon.characteristics.maxRange && this.distanceFromEnnemyInTiles >= weapon.characteristics.minRange) {
                this.attackAnimationLoop();
                attackOtherPlayer(weapon.characteristics.damages)
                this.posture = 'attacking'
            } else if (this.distanceFromEnnemyInTiles < weapon.characteristics.minRange) {
                alert('Vous être trop proche pour attaquer')
            }
        } else {
            alert('Vous ne pouvez pas attaquer à cette distance')
        }
    }
}

export let players: Player[] = [];

export const initialPlayerRender = () => {
    [...Array(2)].forEach((_id, index) => {
        const position = getRandomTilePosition(true, true);
        gameMap.rows[position.row].tiles[position.col].type = 'player';
        const canvas = document.getElementById(`canvas-player-${index + 1}`) as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        const playerClass = getRandomClass();
        const spells = [Fury, Phantom, Cometfall, Doomshadow];
        const getSpells = () => {
            if (playerClass.name === 'Sorcier') {
                return spells
            } else {
                return null
            }
        }
        const getFirstWeapon = () => {
            if (playerClass.name === 'Archer') {
                return FallingStar
            } else if (playerClass.name === 'Guerrier') {
                return Vengeance
            } else {
                return null
            }
        }
        players.push(
            new Player(
                canvas,
                context,
                config.players.names[index],
                playerClass,
                100,
                position.row * config.tileSize,
                position.col * config.tileSize,
                getFirstWeapon(),
                getSpells(),
                index === 0 ? true : false
            )
        )
    });
    players[0].displayInfo()
}

const handleTurn = () => {
    if (players[0].myTurn === true) {
        // Second player's turn begin
        players[1].myTurn = true
        players[1].gameEngine()
        players[1].displayInfo()
        players[1].setPossibleMoves()

        // First player's turn ends
        players[0].myTurn = false
    } else if (players[1].myTurn === true) {
        // First player's turn begin
        players[0].myTurn = true
        players[0].gameEngine()
        players[0].displayInfo()
        players[0].setPossibleMoves()

        // Second player's turn end
        players[1].myTurn = false
    }
}

const attackOtherPlayer = (damages: number) => {
    if (players[0].myTurn === true) {
        players[1].pv -= (players[1].posture === 'defending' ? damages / 2 : damages)
        if (players[1].pv <= 0) {
            alert(players[1].name + ', vous êtes mort...' + '\n' + players[0].name + ', vous avez gagné !')
        }
        handleTurn()
    } else if (players[1].myTurn === true) {
        players[0].pv -= (players[1].posture === 'defending' ? damages / 2 : damages)
        if (players[0].pv <= 0) {
            alert(players[0].name + ', vous êtes mort...' + '\n' + players[1].name + ', vous avez gagné !')
        }
        handleTurn()
    }
}

$('#end-turn').on('click', () => {
    handleTurn()
})
