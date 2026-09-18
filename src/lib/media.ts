import type { ProductMedia } from '../types/product';

export function selectCoverImage(media?: ProductMedia[]): ProductMedia | undefined {
    if (!media || media.length === 0) return undefined;
    return [...media].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.order - b.order;
    })[0];
}
