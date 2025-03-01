import { EntityDto } from "./Core";

export interface UserDto extends EntityDto<string> {
    avatar: string | null;
    userName: string;
    displayName: string;
    passwordHash: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    enabled: boolean;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

