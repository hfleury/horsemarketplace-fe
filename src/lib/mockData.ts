import type { User, MarketplaceItem, Collection, Auction, Category } from '../types/marketplace';

// Mock users
export const mockUsers: User[] = [
    {
        id: '1',
        username: 'EliteStables',
        avatar: 'https://i.pravatar.cc/150?img=1',
        verified: true,
        walletAddress: '0x1234...5678',
    },
    {
        id: '2',
        username: 'HorseTrader',
        avatar: 'https://i.pravatar.cc/150?img=2',
        verified: true,
        walletAddress: '0x8765...4321',
    },
    {
        id: '3',
        username: 'EquineGear',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: false,
        walletAddress: '0xabcd...efgh',
    },
];

// Mock items
export const mockItems: MarketplaceItem[] = [
    {
        id: '1',
        title: 'Majestic Stallion',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
        creator: mockUsers[0],
        owner: mockUsers[1],
        currentBid: 2500,
        likes: 145,
        category: 'Horses',
    },
    {
        id: '2',
        title: 'Premium Leather Saddle',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
        creator: mockUsers[2],
        owner: mockUsers[0],
        currentBid: 1200,
        likes: 203,
        category: 'Saddles',
    },
    {
        id: '3',
        title: 'Wild Mustang',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
        creator: mockUsers[1],
        owner: mockUsers[1],
        currentBid: 1800,
        likes: 89,
        category: 'Horses',
    },
    {
        id: '4',
        title: 'Riding Helmet Pro',
        image: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800&q=80', // Placeholder
        creator: mockUsers[2],
        owner: mockUsers[1],
        currentBid: 150,
        likes: 312,
        category: 'Apparel',
    },
    {
        id: '5',
        title: 'Sunset Rider',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
        creator: mockUsers[1],
        owner: mockUsers[0],
        currentBid: 2100,
        likes: 156,
        category: 'Horses',
    },
    {
        id: '6',
        title: 'Show Jumping Set',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', // Placeholder
        creator: mockUsers[2],
        owner: mockUsers[1],
        currentBid: 3700,
        likes: 245,
        category: 'Equipment',
    },
];

// Mock collections
export const mockCollections: Collection[] = [
    {
        id: '1',
        name: 'Elite Stallions',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
        creator: mockUsers[0],
        floorPrice: 1500,
        volume: 125400,
        change24h: 12.5,
        itemCount: 123,
        verified: true,
    },
    {
        id: '2',
        name: 'Premium Tack',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80',
        creator: mockUsers[2],
        floorPrice: 230,
        volume: 98700,
        change24h: -5.2,
        itemCount: 856,
        verified: true,
    },
    {
        id: '3',
        name: 'Western Riding',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
        creator: mockUsers[1],
        floorPrice: 800,
        volume: 45200,
        change24h: 8.3,
        itemCount: 542,
        verified: false,
    },
    {
        id: '4',
        name: 'Racing Gear',
        image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&q=80',
        creator: mockUsers[0],
        floorPrice: 3500,
        volume: 210800,
        change24h: 18.9,
        itemCount: 210,
        verified: true,
    },
];

// Mock auctions
export const mockAuctions: Auction[] = [
    {
        id: '1',
        item: mockItems[0],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        currentBid: 2500,
        bidCount: 12,
        minBid: 2600,
    },
    {
        id: '2',
        item: mockItems[1],
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        currentBid: 1200,
        bidCount: 8,
        minBid: 1300,
    },
    {
        id: '3',
        item: mockItems[2],
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        currentBid: 1800,
        bidCount: 5,
        minBid: 1900,
    },
    {
        id: '4',
        item: mockItems[3],
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        currentBid: 150,
        bidCount: 23,
        minBid: 160,
    },
];

// Mock categories
export const mockCategories: Category[] = [
    { id: '1', name: 'Horses', icon: '🐴', itemCount: 1234, slug: 'horses' },
    { id: '2', name: 'Saddles', icon: '🪑', itemCount: 987, slug: 'saddles' },
    { id: '3', name: 'Apparel', icon: '👕', itemCount: 456, slug: 'apparel' },
    { id: '4', name: 'Equipment', icon: '🛠️', itemCount: 789, slug: 'equipment' },
    { id: '5', name: 'Health', icon: '🏥', itemCount: 321, slug: 'health' },
    { id: '6', name: 'Transport', icon: '🚛', itemCount: 234, slug: 'transport' },
    { id: '7', name: 'Feed', icon: '🌾', itemCount: 567, slug: 'feed' },
    { id: '8', name: 'Services', icon: '🤝', itemCount: 123, slug: 'services' },
];
