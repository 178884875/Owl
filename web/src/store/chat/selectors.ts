import { ChatState } from "./initialState";



/**
 * 获取所有session id
 */
const getSessions = (state: ChatState) => state.sessions?.map(session => session.id) || [];


/**
 * select Id 获取session
 * @param state
 * @param id
 * @returns 
*/
const getSessionById = (state: ChatState, id: number) => state.sessions?.find(session => session.id === id);

/**
 * 是否选中当前session
 * @param state
 * @param id
 * @returns boolean
 */
const isCurrentSession = (state: ChatState, id: number) => state.currentSession?.id === id;


const getMessages = (state: ChatState) => state.messages?.map(message => message.id) || [];


const getMessagesBySessionId = (state: ChatState, messageId: number) => {
    const message = state.messages?.filter(message => message.id === messageId) || []
    if (message?.length > 0) {
        return message[0]
    }
    return null
}

export const chatSelectors = {
    getSessions,
    getSessionById,
    isCurrentSession,
    getMessages,
    getMessagesBySessionId
}