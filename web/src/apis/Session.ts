import { get } from "../utils/fetch"


/**
 * 获取session列表
 */
export const getSessionLite = (search?: string) => {
    return get('/api/Session/List?search=' + search);
}