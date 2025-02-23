import { LoginInput, RegisterInput } from "../types/Auth";
import { postJson, get, post } from "../utils/fetch";


export function AuthLogin(input: LoginInput) {
    return postJson('/api/Auth/login', input);
}

export function AuthRegister(input: RegisterInput) {
    return postJson('/api/Auth/register', input);
}

/**
 * 获取OAuths列表
 * @returns 
 */
export function OAuths() {
    return get('/api/Auth/oauths');
}

/**
 * 回调
 * @param provider 
 * @param code 
 * @param redirectUri 
 * @returns 
 */
export function Callback(provider: string, code: string, redirectUri: string) {
    return post(`/api/Auth/callback?provider=${provider}&code=${code}&redirectUri=${redirectUri}`);
}
