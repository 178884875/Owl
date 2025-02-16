import { StateCreator } from "zustand";
import { ChatStore } from "./store";
import getModels from "@/apis/Model";
import { createSession, deleteSession, getSessionLite, switchSessionModel, updateSession } from "@/apis/Session";
import { createMessage, deleteMessage } from "@/apis/Message";
import { ChatRole } from "@/types/Chat";
import { message } from "antd";


export interface CreateSessionInput {
    modelId: string;
    value: string;
}

export interface chatCompleteInput {
    sessionId?: number;
}

export interface ChatAction {
    setSideBarExpanded: (expanded: boolean) => void;
    /**
     * 选择session
     */
    selectSession: (id: number) => void;

    /**
     * 删除session
     * @param id
     */
    deleteSession: (id: number) => Promise<void>;

    /**
     * session搜索
     */
    setSearchSessionValue: (value: string) => void;

    /**
     * 加载sessions
     * @param value
     * @constructor
     */
    loadSessions: (value: string) => Promise<void>;

    /**
     * 设置sessions
     * @param sessions
     */
    setSessions: (sessions: any[]) => void;

    /**
     * 打开或关闭session配置
     * @param expanded
     * @constructor
     */
    setSessionConfigExpanded: (expanded: boolean) => void;

    /**
     * 设置消息
     * @param messages
     */
    setMessages: (messages: any[]) => void;

    /**
     * 设置消息
     * @param value
     */
    updateValue: (value: string) => void;

    /**
     * 设置文件
     */
    setFiles: (files: any[]) => void;

    /**
     * 设置文件展开
     */
    setFileExpanded: (expanded: boolean) => void;

    /**
     * 打开或关闭创建session
     */
    setCreateSessionVisible: (visible: boolean) => void;

    /**
     * 加载模型
     */
    loadModels: () => Promise<void>;

    /**
     * 创建会话
     */
    createSession: (input: CreateSessionInput) => Promise<number>;

    /**
     * 完成聊天
     */
    chatComplete: (input: chatCompleteInput) => Promise<void>;

    /**
     * 删除message
     * @param id
     * @constructor
     * @return
     */
    deleteMessage: (id: number) => Promise<void>;

    /**
     * 更新当前session模型
     */
    switchSessionModel: (modelId: string) => Promise<void>;

    /**
     * 更新session
     * @param value
     * @constructor
     * @return
     */
    updateSession: (value: any) => Promise<void>;
}


export const createChatSlice: StateCreator<
    ChatStore,
    [['zustand/devtools', never]],
    [],
    ChatAction
> = (set, get) => ({
    updateSession: async (value: any) => {
        value.avatar = value.avatar ?? '🤖';
        const result = await updateSession(value);
        if (result.success) {
            set({
                currentSession: {
                    ...get().currentSession,
                    ...value
                }
            });
            message.success('更新成功');
        } else {
            message.error(result.message);
        }
    },
    setSideBarExpanded: (expanded: boolean) => {
        set({ sideBarExpanded: expanded });
        localStorage.setItem('sideBarExpanded', expanded ? 'true' : 'false');
    },
    deleteSession: async (id: number) => {
        const result = await deleteSession(id);
        if (result.success) {
            set({
                currentSession: {
                    id: -1,
                }
            });
        }
        await get().loadSessions('');
    },
    selectSession: (id: number) => {
        if (id === -1) {
            set({
                currentSession: {
                    id: -1,
                }
            });
            return;
        }
        set({
            currentSession: get().sessions?.find(session => session.id === id)
        });
    },
    setSearchSessionValue: (value: string) => {
        set({ searchSessionValue: value });
    },
    loadSessions: async (value: string) => {
        const result = await getSessionLite(value);
        set({ sessions: result.data });
    },
    setSessions: (sessions: any[]) => {
        set({ sessions });
    },
    setSessionConfigExpanded: (expanded: boolean) => {
        set({ sessionConfigExpanded: expanded });
    },
    setMessages: (messages: any[]) => {
        set({ messages });
    },
    updateValue: (value: string) => {
        set({ value });
    },
    setFiles: (files: any[]) => {
        set({ files });
    },
    setFileExpanded: (expanded: boolean) => {
        set({ fileExpanded: expanded });
    },
    setCreateSessionVisible: (visible: boolean) => {
        set({ createSessionVisible: visible });
    },
    loadModels: async () => {
        if (get().models.length > 0) {
            return;
        }
        const value = await getModels()
        set({ models: value });
    },
    createSession: async ({
        modelId,
        value
    }: CreateSessionInput) => {
        const result = await createSession({
            name: '默认会话',
            description: '默认会话',
            modelId: modelId,
        });

        get().chatComplete({
            sessionId: result.data.id
        });

        set({ currentSession: result.data });
        await get().loadSessions('');


        return result.data.id;
    },
    chatComplete: async (input: chatCompleteInput) => {
        const value = {
            text: get().value
        }

        const result = await createMessage({
            sessionId: input.sessionId ?? get().currentSession?.id,
            role: ChatRole.User,
            texts: [
                {
                    text: get().value
                }
            ]
        });

    },
    deleteMessage: async (id: number) => {
        const result = await deleteMessage(id);
        if (result.success) {
            const messages = get().messages?.filter(message => message.id !== id);
            set({ messages });
        }
    },
    switchSessionModel: async (modelId: string) => {
        const result = await switchSessionModel(get().currentSession.id, modelId);
        if (result.success) {
            set({
                currentSession: {
                    ...get().currentSession,
                    model: modelId
                }
            });
        }
    }
});