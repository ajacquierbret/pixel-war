class Class {
    type: typeof classes[number]
    name: string
    id: number
    authorizedWeapons: typeof authorizedWeaponsList[number]
}

export class Warrior extends Class {
    skin: string
    damagesBonus: number
    resistanceBonus: number
    authorizedWeapons: typeof authorizedWeaponsList[number]
    constructor(name: string, skin: string) {
        super()
        this.name = name
        this.skin = skin
        this.damagesBonus = 5
        this.resistanceBonus = 3
        this.authorizedWeapons = 'hand to hand weapons'
    }
}

export class Archer extends Class {
    skin: string
    rangeBonus: number
    agilityBonus: number
    authorizedWeapons: typeof authorizedWeaponsList[number]
    constructor(name: string, skin: string) {
        super()
        this.name = name
        this.skin = skin
        this.rangeBonus = 2
        this.agilityBonus = 1
        this.authorizedWeapons = 'ranged weapons'
    }
}

export class Wizard extends Class {
    skin: string
    rangeBonus: number
    authorizedWeapons: typeof authorizedWeaponsList[number]
    constructor(name: string, skin: string) {
        super()
        this.name = name
        this.skin = skin
        this.rangeBonus = 2
        this.authorizedWeapons = 'spells'
    }
}

const authorizedWeaponsList = ['hand to hand weapons', 'ranged weapons', 'spells'] as const
const classes = [Warrior, Archer, Wizard] as const

export default Class