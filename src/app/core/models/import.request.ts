import { ImportDetailRequest } from "./import-detail.model";

export interface ImportRequest {
    supplierId: number;  // Đảm bảo là number, không phải number | null
    employeeId: number;  // Đảm bảo là number, không phải number | null
    status: string;
    notes?: string;
    importDetails: ImportDetailRequest[];
}