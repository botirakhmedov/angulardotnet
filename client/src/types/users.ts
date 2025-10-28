export type User = {
    id: string;
    displayName: string;
    email: string;
    token: string;
    imageUrl?: string;
}

export type LoginCredits = {
    email: string;
    password: string;
}

export type RegisterCredits = {
    email: string;
    displayName: string;
    password: string;
    gender: string;
    dateOfBirth: string;
    city: string;
    country: string;
}