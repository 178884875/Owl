import { StateCreator } from 'zustand';
import { createUserSlice, UserAction } from './action';
import { initialState, UserState } from './initialState';
import { createDevtools } from '../middleware/createDevtools';
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { subscribeWithSelector } from 'zustand/middleware';

export * from './store';



export type UserStore =
    UserState & UserAction;


const createStore: StateCreator<UserStore, [['zustand/devtools', never]]> = (...parameters) => ({
    ...initialState,
    ...createUserSlice(...parameters)
});


const devtools = createDevtools('user');

export const useUserStore = createWithEqualityFn<UserStore>()(
    subscribeWithSelector(devtools(createStore)),
    shallow,
);
