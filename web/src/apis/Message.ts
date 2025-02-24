import { UpdateMessage } from "@/types/Message";
import { del, get, postJson, putJson } from "@/utils/fetch";


/**
 * 获取指定会话下的消息列表
 * @param {string} sessionId 会话ID
 * @param {number} lastId 最后一条消息ID
 */
export function getMessages(sessionId: string, lastId?: number) {
    const query = new URLSearchParams();
    query.append('sessionId', sessionId);
    if (lastId) {
        query.append('lastId', lastId.toString());
    }
    return get(`/api/message/List?${query.toString()}`);
}


/**
 * 创建消息
 * @param input 
 * @returns 
 */
export function createMessage(input: any) {
    return postJson(`/api/message`, input);
}

/**
 * 删除消息
 * @param id 
 * @returns 
 */
export function deleteMessage(id: number) {
    return del(`/api/message?id=${id}`);
}

/**
 * 编辑消息
 * @param {number} id 消息ID
 * @param {UpdateMessage} input 更新的消息内容
 * @returns 
 */
export function updateMessage(id: number, input: UpdateMessage) {
    return putJson(`/api/message?id=${id}`, input);
}