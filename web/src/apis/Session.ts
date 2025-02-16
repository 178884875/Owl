import { del, get, post, postJson, putJson } from "../utils/fetch"


/**
 * 获取session列表
 */
export const getSessionLite = (search?: string) => {
    return get('/api/Session/List?search=' + search);
}

/**
 * 创建session
 * @param value 
 * @returns 
 */
export const createSession = (value: any) => {
    return postJson('/api/Session', value);
}

/**
 * 删除session
 * @param id 
 * @returns 
 */
export const deleteSession = (id: number) => {
    return del(`/api/Session?id=${id}`);
}

/**
 * 切换session模型
 */
export const switchSessionModel = (sessionId: number, modelId: string) => {
    return post(`/api/Session/SwitchModel?sessionId=${sessionId}&modelId=${modelId}`);
}

/**
 * 更新session
 * @param value 
 * @returns 
 */
export const updateSession = (value:any) => {
    return putJson('/api/Session', value);
}