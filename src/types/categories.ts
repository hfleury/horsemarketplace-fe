export interface Category {
  id: string;
  name: string;
  picture_url?: string;
  parent_id?: string;
  subcategories?: Category[];
  created_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  picture_url?: string;
  parent_id?: string;
  file?: File | null;
}

export interface MediaResponse {
  id: string;
  url: string;
}
