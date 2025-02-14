import { ChatState, initialState } from "./initialState";
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';
import { ChatAction, createChatSlice } from "./action";
import { createDevtools } from "../middleware/createDevtools";


export type ChatStore =
    ChatState & ChatAction;

const createStore: StateCreator<ChatStore, [['zustand/devtools', never]]> = (...parameters) => ({
    ...initialState,
    ...createChatSlice(...parameters)
});


const devtools = createDevtools('user');

export const useChatStore = createWithEqualityFn<ChatStore>()(
    subscribeWithSelector(devtools(createStore)),
    shallow,
);
