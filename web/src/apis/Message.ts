import { get } from "@/utils/fetch";


/**
 * 获取指定会话下的消息列表
 * @param {string} sessionId 会话ID
 * @param {number} lastId 最后一条消息ID
 */
export function getMessages(sessionId: string, lastId?: number) {
    return get(`/api/chat/message/List?sessionId=${sessionId}&lastId=${lastId}`);
}