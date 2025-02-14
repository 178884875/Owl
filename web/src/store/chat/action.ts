import { StateCreator } from "zustand";
import { ChatStore } from "./store";


export interface ChatAction {
    setSideBarExpanded: (expanded: boolean) => void;
    /**
     * 选择session
     */
    selectSession: (id: number) => void;

    /**
     * session搜索
     */
    setSearchSessionValue: (value: string) => void;

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
}


export const createChatSlice: StateCreator<
    ChatStore,
    [['zustand/devtools', never]],
    [],
    ChatAction
> = (set, get) => ({
    setSideBarExpanded: (expanded: boolean) => {
        set({ sideBarExpanded: expanded });
        localStorage.setItem('sideBarExpanded', expanded ? 'true' : 'false');
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
    }
});