import { StateCreator } from "zustand";
import { UserStore } from "./store";


export interface UserAction {
    LogOut: () => void;
    SignIn: (token:string) => void;
    GetUserInfo: () => void;
    setUser: (user: any) => void;
}


export const createUserSlice: StateCreator<
    UserStore,
    [['zustand/devtools', never]],
    [],
    UserAction
> = (set, get) => ({
    LogOut: () => {
        localStorage.removeItem('token');
    },
    SignIn: (token) => {
        localStorage.setItem('token', token);
    },
    GetUserInfo: () => {
        const user = localStorage.getItem('user');
        if (user) {
            set({ user: JSON.parse(user) });
        }
    },
    setUser: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user: user });
    }

});