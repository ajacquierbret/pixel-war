import { Animation, cometfallAnimation, doomshadowAnimation, furyAnimation, phantomAnimation } from './animations';
 
class Spell {
    name: string
    id: number
    characteristics: {
        damages: number
        minRange: number
        maxRange: number
    }
    animation: Animation
    constructor(name: string, id: number, characteristics: { damages: number, minRange: number, maxRange: number }, animation: Animation) {
        this.name = name
        this.id = id
        this.characteristics = characteristics
        this.animation = animation
    }
}

export const Fury = new Spell('Fury', 1, {
    damages: 10,
    minRange: 2,
    maxRange: 4,
}, furyAnimation())

export const Cometfall = new Spell('Cometfall', 2, {
    damages: 7,
    minRange: 4,
    maxRange: 5,
}, cometfallAnimation())

export const Doomshadow = new Spell('Doomshadow', 3, {
    damages: 15,
    minRange: 2,
    maxRange: 4,
}, doomshadowAnimation())

export const Phantom = new Spell('Phantom', 4, {
    damages: 5,
    minRange: 5,
    maxRange: 7,
}, phantomAnimation())

export default Spell