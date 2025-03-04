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


/**
 * 获取所有唯一的消息Ids
 * @param state
 * @returns 
 */
const getMessages = (state: ChatState) => [...new Set(state.messages?.map(message => message.id) || [])];


const getMessagesBySessionId = (state: ChatState, messageId: number) => {
    const message = state.messages?.filter(message => message.id === messageId) || []
    if (message?.length > 0) {
        return message[0]
    }
    return null
}

const getCurrentModel = (state: ChatState) => {
    // 从state.currentSession中获取modelId
    const modelId = state.currentSession?.model;
    // 从state.models中获取model
    const model = state.models?.find(item => item.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === modelId) !== undefined)?.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === modelId);

    return model
}

export const chatSelectors = {
    getSessions,
    getSessionById,
    isCurrentSession,
    getMessages,
    getMessagesBySessionId,
    getCurrentModel
}