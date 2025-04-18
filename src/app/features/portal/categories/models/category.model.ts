export interface Category {
    id: number;
    name: string;
    description: string;
    productCount: number;
    parentId: number | null;
    children?: Category[] | null;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface CategoryParent extends Category {
    parentName?: string;
}

export interface DialogData {
    category?: any;
    categories: { id: number; name: string }[];
}

export interface CategoryRequest {
    name: string;
    description?: string;
    parentId?: number | null;
    status?: 'ACTIVE' | 'INACTIVE';
}