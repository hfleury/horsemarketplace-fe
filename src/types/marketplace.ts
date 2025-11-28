export interface User {
    id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    walletAddress?: string;
}

export interface MarketplaceItem {
    id: string;
    title: string;
    image: string;
    creator: User;
    owner: User;
    currentBid?: number;
    floorPrice?: number;
    likes?: number;
    category?: string;
}

export interface Collection {
    id: string;
    name: string;
    image: string;
    banner?: string;
    creator: User;
    floorPrice: number;
    volume: number;
    change24h: number;
    itemCount: number;
    verified?: boolean;
}

export interface Auction {
    id: string;
    item: MarketplaceItem;
    startTime: Date;
    endTime: Date;
    currentBid: number;
    bidCount: number;
    minBid: number;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    itemCount: number;
    slug: string;
}

export interface Bid {
    id: string;
    bidder: User;
    amount: number;
    timestamp: Date;
}
