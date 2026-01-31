export enum ProductType {
    Horse = 'horse',
    Vehicle = 'vehicle',
    Equipment = 'equipment',
    Service = 'service',
    Property = 'property'
}

export enum ProductStatus {
    Draft = 'draft',
    Published = 'published',
    PendingApproval = 'pending_approval',
    Sold = 'sold',
    Archived = 'archived',
    Deleted = 'deleted'
}

export interface ProductMedia {
    id: string;
    url: string;
    is_primary: boolean;
}

export interface HorseSpecifics {
    name?: string;
    age?: number;
    year_of_birth?: number;
    gender?: string;
    height?: number;
    breed?: string;
    color?: string;
    dressage_level?: string;
    jump_level?: string;
    orientation?: string;
    pedigree?: Record<string, unknown>; // JSON structure for family tree
}

export interface VehicleSpecifics {
    make?: string;
    model?: string;
    year?: number;
    load_weight?: number;
    total_weight?: number;
    condition?: string;
}

export interface EquipmentSpecifics {
    make?: string;
    model?: string;
    size?: string;
    condition?: string;
    sub_type?: string;
    boom_width?: string;
}

export interface Product {
    id: string;
    user_id: string;
    category_id?: string;
    type: ProductType;
    status: ProductStatus;
    title: string;
    price_sek?: number;
    description?: string;
    city?: string;
    area?: string;
    transaction_type?: string;
    views_count: number;
    created_at: string;
    updated_at: string;

    // Pictures
    media?: ProductMedia[];

    // Specifics
    horse?: HorseSpecifics;
    vehicle?: VehicleSpecifics;
    equipment?: EquipmentSpecifics;
}

export interface CreateProductRequest {
    title: string;
    type: ProductType;
    status: ProductStatus;
    price_sek: number;
    description: string;
    city: string;
    area?: string;
    transaction_type: string;

    // Specifics flattened or nested? Backend expects nested
    horse?: HorseSpecifics;
    vehicle?: VehicleSpecifics;
    equipment?: EquipmentSpecifics;
}
