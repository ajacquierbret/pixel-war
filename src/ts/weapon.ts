const weaponTypes = ['Axe', 'Sword', 'Bow', 'Dagger'] as const
import { Animation, bloodMoonAnimation, fallingStarAnimation, heartStrikerAnimation, strikerAnimation, swordOfDoomAnimation, vengeanceAnimation } from './animations'
import weapon0 from '../../assets/img/weapons/weapon-0.png'
import weapon1 from '../../assets/img/weapons/weapon-1.png'
import weapon2 from '../../assets/img/weapons/weapon-2.png'
import weapon3 from '../../assets/img/weapons/weapon-3.png'
import weapon4 from '../../assets/img/weapons/weapon-4.png'
import weapon5 from '../../assets/img/weapons/weapon-5.png'

export class Weapon {
    name: string
    id: number
    type: typeof weaponTypes[number]
    characteristics: {
        damages: number;
        minRange: number;
        maxRange: number;
    }
    skin: string;
    animation: Animation
    constructor(name: string, id: number, type: typeof weaponTypes[number], characteristics: { damages: number, minRange: number, maxRange: number }, skin: string, animation: Animation) {
        this.name = name;
        this.id = id;
        this.type = type
        this.characteristics = characteristics;
        this.skin = skin;
        this.animation = animation
    }
}

export const SwordOfDoom = new Weapon('Sword Of Doom', 0, 'Sword', {
    damages: 20,
    minRange: 1,
    maxRange: 1,
}, weapon0, swordOfDoomAnimation());

export const HeartStriker = new Weapon('Heartstriker', 1, 'Bow', {
    damages: 14,
    minRange: 2,
    maxRange: 4,
}, weapon1, heartStrikerAnimation());

export const FallingStar = new Weapon('Falling Star', 2, 'Bow', {
    damages: 10,
    minRange: 3,
    maxRange: 5,
}, weapon2, fallingStarAnimation());

export const BloodMoon = new Weapon('Bloodmoon', 3, 'Axe', {
    damages: 15,
    minRange: 1,
    maxRange: 1,
}, weapon3, bloodMoonAnimation())

export const Striker = new Weapon('Striker', 4, 'Axe', {
    damages: 12,
    minRange: 2,
    maxRange: 2,
}, weapon4, strikerAnimation())

export const Vengeance = new Weapon('Vengeance', 5, 'Dagger', {
    damages: 10,
    minRange: 1,
    maxRange: 1,
}, weapon5, vengeanceAnimation())

export const weaponsList = [SwordOfDoom, HeartStriker, FallingStar, BloodMoon, Striker, Vengeance]