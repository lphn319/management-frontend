import { Department } from "../../departments/models/department.model";
import { Role } from "../../roles/models/role.model";

export interface Employee {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: string;
    status: 'ACTIVE' | 'INACTIVE';
    roleName: string;
    departmentName: string;
    createdAt: Date;
    updatedAt: Date;

    // Helper method for backward compatibility
    isActive?: boolean;
}

export interface EmployeeRequest {
    name: string;
    email: string;
    phoneNumber: string;
    password?: string;
    dateOfBirth: Date;
    gender: string;
    departmentId: number;
    roleId: number;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface EmployeeStats {
    total: number;
    active: number;
    inactive: number;
    onLeave?: number;
    departments: { [key: string]: number };
}

export interface DialogData {
    employee?: Employee;
    departments: Department[];
    roles: Role[];
    viewOnly?: boolean;
}