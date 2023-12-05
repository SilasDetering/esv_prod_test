export class User {
    firstName: string | undefined;
    lastName: string | undefined;
    username: string | undefined;
    password: string | undefined;
    email: string | undefined;
    isAdmin: boolean | undefined;
}

export class UpdateUser {
    firstName: string | undefined;
    lastName: string | undefined;
    username: string | undefined;
    email: string | undefined;
    isAdmin: boolean | undefined;
    oldUsername: string | undefined;
}