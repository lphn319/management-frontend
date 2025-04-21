export interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export interface RoleRequest {
    name: string;
    permissions: string[];
}

export interface DialogData {
    role?: Role;
    viewOnly?: boolean;
}