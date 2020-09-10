import * as config from '../../config';

// Spells spritesheets
import furyAnimImg from '../../assets/animations/spells/fury.png';
import cometfallAnimImg from '../../assets/animations/spells/cometfall.png';
import doomshadowAnimImg from '../../assets/animations/spells/doomshadow.png';
import phantomAnimImg from '../../assets/animations/spells/phantom.png';

// Weapons spritesheets
import swordofdoomAnimImg from '../../assets/animations/weapons/swordofdoom.png';
import heartstrikerAnimImg from '../../assets/animations/weapons/heartstriker.png';
import fallingstarAnimImg from '../../assets/animations/weapons/fallingstar.png';
import bloodmoonAnimImg from '../../assets/animations/weapons/bloodmoon.png';
import strikerAnimImg from '../../assets/animations/weapons/striker.png';
import vengeanceAnimImg from '../../assets/animations/weapons/vengeance.png';
import { animationsCanvas } from './map';

export class Animation {
    spritesheet: HTMLImageElement;
    width: number;
    height: number;
    timePerFrame: number;
    numberOfFrames: number;
    frameIndex: number;
    lastUpdate: number;
    update: () => void;
    draw: (context: CanvasRenderingContext2D, x: number, y: number) => void;
    constructor(spritesheet: HTMLImageElement, width: number, height: number, timePerFrame: number, numberOfFrames: number) {
        this.spritesheet = spritesheet;
        this.width = width;
        this.height = height;
        this.timePerFrame = timePerFrame;
        this.numberOfFrames = numberOfFrames || 1;

        this.frameIndex = 0;

        this.lastUpdate = Date.now();

        this.update = () => {
            if (Date.now() - this.lastUpdate >= this.timePerFrame) {
                this.frameIndex++;
                if (this.frameIndex >= this.numberOfFrames) {
                    this.frameIndex = 0;
                }
                this.lastUpdate = Date.now();
            }
        }

        this.draw = (context, x, y) => {
            context.drawImage(this.spritesheet, this.frameIndex * this.width / this.numberOfFrames, 0, this.width / this.numberOfFrames, this.height, x, y, this.width / this.numberOfFrames, this.height);
        }
    }

    getNumberOfFrames() {
        return this.numberOfFrames
    }
}

/////// SPELLS

const furySpriteSheet = new Image();
furySpriteSheet.src = furyAnimImg;

const cometfallSpriteSheet = new Image();
cometfallSpriteSheet.src = cometfallAnimImg;

const doomshadowSpriteSheet = new Image();
doomshadowSpriteSheet.src = doomshadowAnimImg;

const phantomSpriteSheet = new Image();
phantomSpriteSheet.src = phantomAnimImg;

export const furyAnimation = furySpriteSheet.onload = () => new Animation(
    furySpriteSheet,
    2688,
    96,
    5,
    28,
)

export const cometfallAnimation = cometfallSpriteSheet.onload = () => new Animation(
    cometfallSpriteSheet,
    2688,
    96,
    5,
    28,
)

export const doomshadowAnimation = doomshadowSpriteSheet.onload = () => new Animation(
    doomshadowSpriteSheet,
    2688,
    96,
    5,
    28,
) 

export const phantomAnimation = phantomSpriteSheet.onload = () => new Animation(
    phantomSpriteSheet,
    2976,
    96,
    5,
    31,
)

/////// WEAPONS

const swordOfDoomSpriteSheet = new Image();
swordOfDoomSpriteSheet.src = swordofdoomAnimImg;

const heartStrikerSpriteSheet = new Image();
heartStrikerSpriteSheet.src = heartstrikerAnimImg;

const fallingStarSpriteSheet = new Image();
fallingStarSpriteSheet.src = fallingstarAnimImg;

const bloodMoonSpriteSheet = new Image();
bloodMoonSpriteSheet.src = bloodmoonAnimImg;

const strikerSpriteSheet = new Image();
strikerSpriteSheet.src = strikerAnimImg;

const vengeanceSpriteSheet = new Image();
vengeanceSpriteSheet.src = vengeanceAnimImg;

export const swordOfDoomAnimation = swordOfDoomSpriteSheet.onload = () => new Animation(
    swordOfDoomSpriteSheet,
    704,
    64,
    20,
    11,
)

export const heartStrikerAnimation = heartStrikerSpriteSheet.onload = () => new Animation(
    heartStrikerSpriteSheet,
    704,
    64,
    20,
    11,
)

export const fallingStarAnimation = fallingStarSpriteSheet.onload = () => new Animation(
    fallingStarSpriteSheet,
    704,
    64,
    20,
    11,
)

export const bloodMoonAnimation = bloodMoonSpriteSheet.onload = () => new Animation(
    bloodMoonSpriteSheet,
    1280,
    64,
    20,
    10,
)

export const strikerAnimation = strikerSpriteSheet.onload = () => new Animation(
    strikerSpriteSheet,
    704,
    64,
    20,
    11, 
)

export const vengeanceAnimation = vengeanceSpriteSheet.onload = () => new Animation(
    vengeanceSpriteSheet,
    704,
    64,
    20,
    11,
)