import { StateCreator } from "zustand";
import { ChatStore } from "./store";


export interface ChatAction {
    setSideBarExpanded: (expanded: boolean) => void;
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
});