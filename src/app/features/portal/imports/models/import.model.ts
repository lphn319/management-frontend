import { Employee } from "../../employees/models/employee.model";
import { Supplier } from "../../suppliers/models/supplier.model";
import { ImportDetail } from "./import-detail.model";

export interface Import {
    id?: number;
    supplier: Supplier;
    employee: Employee;
    importDetails: ImportDetail[];
    quantity: number;
    totalAmount: number;
    status: 'processing' | 'completed' | 'cancelled';
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}