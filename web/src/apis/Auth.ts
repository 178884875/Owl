import { LoginInput } from "../types/Auth";
import { postJson } from "../utils/fetch";


export default function AuthLogin(input: LoginInput) {
    return postJson('/api/Auth/login', input);
}