export const FEATURED_SYMBOLS = ['HBL', 'UBL', 'MCB', 'HUBC', 'FFC'] as const;
export type FeaturedSymbol = typeof FEATURED_SYMBOLS[number];

export const PSX_API_BASE = process.env.PSX_API_BASE || 'https://psxterminal.com';
export const PSX_WS_URL = 'wss://psxterminal.com/';
