export type UserRole = 'ADMIN' | 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER';

export interface UserLogin {
    id: number;
    name: string;
    email: string;
    roleName: UserRole;
}