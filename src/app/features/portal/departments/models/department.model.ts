export interface Department {
    id: number;
    name: string;
    description?: string;
}

export interface DepartmentRequest {
    name: string;
    description?: string;
}

export interface DialogData {
    department?: Department;
    viewOnly?: boolean;
}