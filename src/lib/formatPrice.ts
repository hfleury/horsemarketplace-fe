export function formatPrice(priceSek?: number): string {
    if (priceSek === undefined || priceSek === null) return 'Price on request';
    return `${priceSek.toLocaleString('sv-SE')} SEK`;
}
