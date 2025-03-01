import { StateCreator } from "zustand";
import { ChatStore } from "./store";
import getModels from "@/apis/Model";
import { createSession, deleteSession, getSessionLite, switchSessionModel, toggleFavorite, updateSession } from "@/apis/Session";
import { createMessage, deleteMessage } from "@/apis/Message";
import { ChatCompleteParams, ChatRole } from "@/types/Chat";
import { message } from "antd";
import { chatComplete, generateSessionName } from '@/apis/Chat';
import { chatSelectors } from "./selectors";
import { uploadFile } from "@/apis/FileStorage";


export interface CreateSessionInput {
    modelId: string;
    value: string;
    files?: any[];
}

export interface chatCompleteInput {
    sessionId?: number;
    value?: string;
    files?: any[];
}

export interface CreateMessageInput {
    sessionId: number;
    value: string;
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
    loadModels: () => Promise<any[]>;

    /**
     * 创建会话
     */
    createSession: (input: CreateSessionInput) => Promise<number>;

    /**
     * 创建消息并且发送
     * @param input 
     * @returns 
     */
    createMessageAndSend: (input: CreateMessageInput) => Promise<void>;

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

    /**
     * 重新生成
     */
    regenerateMessage: (id: number) => Promise<void>;

    /**
     * 重命名session
     */
    renameSession: (id: number) => Promise<void>;

    /**
     * 切换联网状态
     * @returns 
     */
    switchNetworking: () => void;

    /**
     * 切换收藏状态
     */
    toggleFavorite: (id: number) => Promise<void>;
}


export const createChatSlice: StateCreator<
    ChatStore,
    [['zustand/devtools', never]],
    [],
    ChatAction
> = (set, get) => ({
    switchNetworking: () => {
        set({
            networking: !get().networking
        })
    },
    toggleFavorite: async (id: number) => {
        const result = await toggleFavorite(id);
        if (result.success) {
            // 更新session列表
            await get().loadSessions('');

            message.success(result.data ? '已收藏' : '已取消收藏');
        } else {
            message.error(result.message);
        }
    },
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
    renameSession: async (id: number) => {
        try {
            const result = await generateSessionName(id);
            if (result.success) {
                // 更新session列表
                const sessions = get().sessions?.map(session => session.id === id ? { ...session, name: result.data } : session);
                set({ sessions });
            }
        } catch (error) {
            console.error('Error in renameSession:', error);
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
            return get().models;
        }
        const value = await getModels()
        set({ models: value.data });
        return value.data;
    },
    createSession: async ({
        modelId,
        value,
        files
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
                value,
                files
            });
        }, 300);

        return result.data.id;
    },
    createMessageAndSend: async (input: CreateMessageInput) => {

        const fileItems = []

        for (let i = 0; i < get().files.length; i++) {
            const file = get().files[i];
            const result = await uploadFile(file.originFileObj);
            if (result.success) {
                fileItems.push({
                    id: result.data.id,
                    fileName: result.data.fileName,
                    path: result.data.path,
                });
            }
        }

        const userMessage = {
            sessionId: input.sessionId,
            role: ChatRole.User,
            texts: [{ text: input.value }],
            files: fileItems.map(file => ({
                fileId: file.id,
                FileUrl: file.path,
                fileName: file.fileName
            })),
            id: 0
        };

        const messageResponse = await createMessage(userMessage);
        userMessage.id = messageResponse.data.id;

        set({ messages: [...get().messages, userMessage], value: '', files: [], generateLoading: true });

        const tempAiMessage = {
            sessionId: input.sessionId,
            role: ChatRole.Assistant,
            texts: [{ text: '...', id: 0, reasoningUpdate: '', searchResults: [] }],
            isLoading: true,
            id: 0,
            modelUsages: null
        };

        const aiMessageResponse = await createMessage(tempAiMessage);
        tempAiMessage.id = aiMessageResponse.data.id;
        tempAiMessage.texts[0].id = aiMessageResponse.data.id;

        set({ messages: [...get().messages, tempAiMessage], fileExpanded: false });


        const chatCompleteParams = {
            sessionId: input.sessionId,
            parentId: 0,
            networking: get().networking,
            text: userMessage.texts[0].text,
            fileIds: userMessage.files.map(file => file.fileId),
            functionCalls: [],
            assistantMessageId: tempAiMessage.texts[tempAiMessage.texts.length - 1].id
        };

        let accumulatedText = '';
        let reasoningUpdate = '';
        let lastUpdateTime = Date.now();
        for await (const chunk of chatComplete(chatCompleteParams)) {
            const { data, type } = chunk;
            if (type === 'chat') {
                accumulatedText += data;
                tempAiMessage.texts[tempAiMessage.texts.length - 1].text = accumulatedText;

                const currentTime = Date.now();
                if (currentTime - lastUpdateTime >= 100) {
                    set({ messages: [...get().messages] });
                    lastUpdateTime = currentTime;
                }
            } else if (type === 'reasoning') {
                reasoningUpdate += data;
                tempAiMessage.texts[tempAiMessage.texts.length - 1].reasoningUpdate = reasoningUpdate;
                const currentTime = Date.now();
                if (currentTime - lastUpdateTime >= 100) {
                    set({ messages: [...get().messages] });
                    lastUpdateTime = currentTime;
                }
            } else if (type === 'search') {
                const items = data as any[];
                items.forEach(item => {
                    // @ts-ignore
                    tempAiMessage.texts[tempAiMessage.texts.length - 1].searchResults.push(item)
                });
                set({ messages: [...get().messages] });
            } else if (type === 'model_usage') {
                tempAiMessage.modelUsages = data;
            }
        }

        set({ messages: [...get().messages], generateLoading: false });

        await get().renameSession(input.sessionId);
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
            files: input.files?.map(file => ({
                fileId: file.id,
                fileName: file.fileName,
                FileUrl: file.path,
            })) ?? get().files.map(file => ({
                fileId: file.id,
                fileName: file.fileName,
                FileUrl: file.path,
            })),
            id: 0
        };


        const result = await createMessage(userMessage);
        userMessage.id = result.data.id;
        // 添加一个临时的AI响应消息
        const tempAiMessage = {
            sessionId: sessionId,
            role: ChatRole.Assistant,
            texts: [{ text: '...', id: 0, reasoningUpdate: '', searchResults: [] }],
            isLoading: true,
            id: 0,
            modelUsages: null
        };

        const messageResponse = await createMessage(tempAiMessage);
        tempAiMessage.id = messageResponse.data.id;
        tempAiMessage.texts[0].id = messageResponse.data.id;

        // 创建新的消息数组副本，而不是修改原数组
        const updatedMessages = [...get().messages, userMessage, tempAiMessage];

        // 使用新数组更新状态
        set({
            messages: updatedMessages,
            generateLoading: true
        });

        try {
            const chatCompleteParams = {
                sessionId: sessionId,
                parentId: 0,
                text: userMessage.texts[0].text,
                fileIds: userMessage.files.map(file => file.fileId),
                functionCalls: [],
                networking: get().networking,
                assistantMessageId: tempAiMessage.texts[tempAiMessage.texts.length - 1].id
            } as ChatCompleteParams;

            let accumulatedText = '';
            let lastUpdateTime = Date.now();
            let reasoningUpdate = '';

            for await (const chunk of chatComplete(chatCompleteParams)) {
                const { data, type } = chunk;
                if (type === 'chat') {
                    accumulatedText += data;
                    tempAiMessage.texts[tempAiMessage.texts.length - 1].text = accumulatedText;

                    // 每100ms更新一次，创建全新数组
                    const currentTime = Date.now();
                    if (currentTime - lastUpdateTime >= 100) {
                        set({ messages: [...get().messages] });
                        lastUpdateTime = currentTime;
                    }
                } else if (type === 'reasoning') {
                    reasoningUpdate += data;
                    tempAiMessage.texts[tempAiMessage.texts.length - 1].reasoningUpdate = reasoningUpdate;
                    const currentTime = Date.now();
                    if (currentTime - lastUpdateTime >= 100) {
                        set({ messages: [...get().messages] });
                        lastUpdateTime = currentTime;
                    }
                } else if (type === 'search') {
                    const items = data as any[];
                    items.forEach(item => {
                        tempAiMessage.texts[tempAiMessage.texts.length - 1].searchResults.push(item)
                    });
                    set({ messages: [...get().messages] });
                } else if (type === 'model_usage') {
                    tempAiMessage.modelUsages = data;
                    set({ messages: [...get().messages] });
                }
            }
            set({ messages: [...get().messages], generateLoading: false });

            await get().renameSession(sessionId);

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
                ),
                generateLoading: false
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
    },
    regenerateMessage: async (id: number) => {
        const message = chatSelectors.getMessagesBySessionId(get(), id);
        if (message.role === ChatRole.Assistant) {
            // 如果是AI消息，则删除AI消息
            await deleteMessage(id);
            set((state) => ({
                messages: state.messages.filter(msg => msg.id !== id)
            }))

        }
        // 然后创建新的AI消息
        const tempAiMessage = {
            sessionId: get().currentSession.id,
            role: ChatRole.Assistant,
            texts: [{ text: '...', id: 0, reasoningUpdate: '', searchResults: [] }],
            isLoading: true,
            id: 0,
            modelUsages: null
        };
        const messageResponse = await createMessage(tempAiMessage);
        tempAiMessage.id = messageResponse.data.id;
        tempAiMessage.texts[0].id = messageResponse.data.id;
        const messages = get().messages;

        messages.push(tempAiMessage);


        set((state) => ({
            messages: [...state.messages],
            generateLoading: true
        }))

        try {

            const chatCompleteParams = {
                sessionId: get().currentSession.id,
                parentId: 0,
                text: '',
                fileIds: [],
                networking: get().networking,
                functionCalls: [],
                // @ts-ignore
                assistantMessageId: tempAiMessage.texts[tempAiMessage.texts.length - 1].id
            } as ChatCompleteParams;

            let accumulatedText = '';

            let lastUpdateTime = Date.now();
            let reasoningUpdate = '';
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
                } else if (type === 'reasoning') {
                    reasoningUpdate += data;
                    tempAiMessage.texts[tempAiMessage.texts.length - 1].reasoningUpdate = reasoningUpdate;
                    const currentTime = Date.now();
                    if (currentTime - lastUpdateTime >= 100) {
                        set({ messages: [...messages] });
                        lastUpdateTime = currentTime;
                    }
                } else if (type === 'search') {
                    const items = data as any[];
                    items.forEach(item => {
                        // @ts-ignore
                        tempAiMessage.texts[tempAiMessage.texts.length - 1].searchResults.push(item)
                    });
                    set({ messages: [...messages] });
                }
                else if (type === 'model_usage') {
                    tempAiMessage.modelUsages = data;
                }
            }
            set({ messages: [...messages], generateLoading: false });

            await get().renameSession(get().currentSession.id);

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
                ),
                generateLoading: false
            }));
            message.error('发送消息失败');
        }
    }
});