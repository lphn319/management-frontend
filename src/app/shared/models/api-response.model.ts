export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export class ApiResponseHelper {
    static success<T>(data: T): ApiResponse<T> {
        return {
            success: true,
            message: "SUCCESS",
            data: data
        };
    }

    static successWithMessage<T>(message: string, data: T): ApiResponse<T> {
        return {
            success: true,
            message: message,
            data: data
        };
    }

    static error<T>(message: string): ApiResponse<T> {
        return {
            success: false,
            message: message,
            data: null as unknown as T
        };
    }
}