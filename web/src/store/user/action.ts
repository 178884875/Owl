import { StateCreator } from "zustand";
import { UserStore } from "./store";


export interface UserAction {
    LogOut: () => void;
    SignIn: (token:string) => void;
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
    }
});