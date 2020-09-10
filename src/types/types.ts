export const differentTiles = ['empty', 'obstacle', 'weapon', 'player'] as const;

export type TileType = typeof differentTiles[number];

export type Direction = 'left' | 'right' | 'up' | 'down';

export type Range = 'close' | 'distance';

export type Posture = 'defending' | 'attacking';