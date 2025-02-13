import { get } from "../utils/fetch";


/**
 * 获取验证码
 */
export default function Verification(type: string) {
    return get('/api/verification?type=' + type);
}