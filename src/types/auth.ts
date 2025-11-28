export interface User {
    username: string;
    email: string;
    avatar?: string;
    verified?: boolean;
}

export interface AuthResponse {
    status: 'success' | 'error';
    message: string;
    data: {
        token: string;
        user: User;
        expires_at: string;
    };
}

export interface LoginCredentials {
    username: string;
    password: string;
}