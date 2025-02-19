import { StateCreator } from "zustand";
import { ChatStore } from "./store";
import getModels from "@/apis/Model";
import { createSession, deleteSession, getSessionLite, switchSessionModel, updateSession } from "@/apis/Session";
import { createMessage, deleteMessage } from "@/apis/Message";
import { ChatCompleteParams, ChatRole } from "@/types/Chat";
import { message } from "antd";
import { chatComplete } from '@/apis/Chat';


export interface CreateSessionInput {
    modelId: string;
    value: string;
}

export interface chatCompleteInput {
    sessionId?: number;
    value?: string;
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

        set({ currentSession: result.data, messages: [] });
        await get().loadSessions('');

        setTimeout(() => {
            get().chatComplete({
                sessionId: result.data.id,
                value
            });
        }, 300);

        return result.data.id;
    },
    chatComplete: async (input: chatCompleteInput) => {
        const sessionId = input.sessionId ?? get().currentSession?.id;
        const userMessage = {
            sessionId: sessionId,
            role: ChatRole.User,
            texts: [
                {
                    text: input.value
                }
            ],
            files: get().files.map(file => ({
                fileId: file.id,
                FileUrl: file.path,
                fileName: file.fileName
            })),
            id: 0
        };


        const result = await createMessage(userMessage);
        userMessage.id = result.data.id;
        // 添加一个临时的AI响应消息
        const tempAiMessage = {
            sessionId: sessionId,
            role: ChatRole.Assistant,
            texts: [{ text: '...', id: 0 }],
            isLoading: true,
            id: 0
        };

        const messageResponse = await createMessage(tempAiMessage);
        tempAiMessage.id = messageResponse.data.id;
        tempAiMessage.texts[0].id = messageResponse.data.id;
        const messages = get().messages;

        messages.push(userMessage);

        messages.push(tempAiMessage);


        set((state) => ({
            messages: [...state.messages]
        }))

        try {

            const chatCompleteParams = {
                sessionId: sessionId,
                parentId: 0,
                text: userMessage.texts[0].text,
                fileIds: userMessage.files.map(file => file.fileId),
                functionCalls: [],
                // @ts-ignore
                assistantMessageId: tempAiMessage.texts[tempAiMessage.texts.length - 1].id
            } as ChatCompleteParams;

            let accumulatedText = '';

            let lastUpdateTime = Date.now();
            for await (const chunk of chatComplete(chatCompleteParams)) {
                const { data, type } = chunk;
                if (type === 'chat') {
                    accumulatedText += data;
                    tempAiMessage.texts[tempAiMessage.texts.length - 1].text = accumulatedText;

                    // 每100ms更新一次
                    const currentTime = Date.now();
                    if (currentTime - lastUpdateTime >= 100) {
                        set({ messages: [...messages] });
                        lastUpdateTime = currentTime;
                    }
                }
            }
            set({ messages: [...messages] });


        } catch (error) {
            console.error('Error in chatComplete:', error);
            // 将临时AI消息标记为错误
            set(state => ({
                messages: state.messages.map(msg =>
                    msg === tempAiMessage ? {
                        ...msg,
                        texts: [{ text: '发送消息失败' }],
                        isLoading: false,
                        isError: true
                    } : msg
                )
            }));
            message.error('发送消息失败');
        }
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