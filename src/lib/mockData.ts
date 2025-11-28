import type { User, NFTItem, Collection, Auction, Category } from '../types/marketplace';

// Mock users
export const mockUsers: User[] = [
    {
        id: '1',
        username: 'CryptoKing',
        avatar: 'https://i.pravatar.cc/150?img=1',
        verified: true,
        walletAddress: '0x1234...5678',
    },
    {
        id: '2',
        username: 'NFTCollector',
        avatar: 'https://i.pravatar.cc/150?img=2',
        verified: true,
        walletAddress: '0x8765...4321',
    },
    {
        id: '3',
        username: 'ArtLover',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: false,
        walletAddress: '0xabcd...efgh',
    },
];

// Mock NFT items
export const mockNFTItems: NFTItem[] = [
    {
        id: '1',
        title: 'Majestic Stallion #001',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
        creator: mockUsers[0],
        owner: mockUsers[1],
        currentBid: 2.5,
        likes: 145,
        category: 'Horses',
    },
    {
        id: '2',
        title: 'Arabian Beauty #042',
        image: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800&q=80',
        creator: mockUsers[1],
        owner: mockUsers[0],
        currentBid: 3.2,
        likes: 203,
        category: 'Horses',
    },
    {
        id: '3',
        title: 'Wild Mustang #127',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
        creator: mockUsers[2],
        owner: mockUsers[2],
        currentBid: 1.8,
        likes: 89,
        category: 'Horses',
    },
    {
        id: '4',
        title: 'Thoroughbred Champion',
        image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=800&q=80',
        creator: mockUsers[0],
        owner: mockUsers[1],
        currentBid: 4.5,
        likes: 312,
        category: 'Horses',
    },
    {
        id: '5',
        title: 'Sunset Rider #089',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
        creator: mockUsers[1],
        owner: mockUsers[0],
        currentBid: 2.1,
        likes: 156,
        category: 'Horses',
    },
    {
        id: '6',
        title: 'Black Beauty Tribute',
        image: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800&q=80',
        creator: mockUsers[2],
        owner: mockUsers[1],
        currentBid: 3.7,
        likes: 245,
        category: 'Horses',
    },
];

// Mock collections
export const mockCollections: Collection[] = [
    {
        id: '1',
        name: 'Premium Stallions',
        image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80',
        creator: mockUsers[0],
        floorPrice: 1.5,
        volume: 125.4,
        change24h: 12.5,
        itemCount: 1234,
        verified: true,
    },
    {
        id: '2',
        name: 'Arabian Legends',
        image: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&q=80',
        creator: mockUsers[1],
        floorPrice: 2.3,
        volume: 98.7,
        change24h: -5.2,
        itemCount: 856,
        verified: true,
    },
    {
        id: '3',
        name: 'Wild West Horses',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
        creator: mockUsers[2],
        floorPrice: 0.8,
        volume: 45.2,
        change24h: 8.3,
        itemCount: 542,
        verified: false,
    },
    {
        id: '4',
        name: 'Racing Champions',
        image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400&q=80',
        creator: mockUsers[0],
        floorPrice: 3.5,
        volume: 210.8,
        change24h: 18.9,
        itemCount: 2103,
        verified: true,
    },
];

// Mock auctions
export const mockAuctions: Auction[] = [
    {
        id: '1',
        item: mockNFTItems[0],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        currentBid: 2.5,
        bidCount: 12,
        minBid: 2.6,
    },
    {
        id: '2',
        item: mockNFTItems[1],
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        currentBid: 3.2,
        bidCount: 8,
        minBid: 3.3,
    },
    {
        id: '3',
        item: mockNFTItems[2],
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        currentBid: 1.8,
        bidCount: 5,
        minBid: 1.9,
    },
    {
        id: '4',
        item: mockNFTItems[3],
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        currentBid: 4.5,
        bidCount: 23,
        minBid: 4.6,
    },
];

// Mock categories
export const mockCategories: Category[] = [
    { id: '1', name: 'Stallions', icon: '🐴', itemCount: 1234, slug: 'stallions' },
    { id: '2', name: 'Mares', icon: '🐎', itemCount: 987, slug: 'mares' },
    { id: '3', name: 'Foals', icon: '🦄', itemCount: 456, slug: 'foals' },
    { id: '4', name: 'Racing', icon: '🏇', itemCount: 789, slug: 'racing' },
    { id: '5', name: 'Show Horses', icon: '🎪', itemCount: 321, slug: 'show-horses' },
    { id: '6', name: 'Wild Horses', icon: '🌄', itemCount: 234, slug: 'wild-horses' },
    { id: '7', name: 'Ponies', icon: '🐴', itemCount: 567, slug: 'ponies' },
    { id: '8', name: 'Draft Horses', icon: '💪', itemCount: 123, slug: 'draft-horses' },
];
