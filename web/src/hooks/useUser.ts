import { getCurrentUser } from "@/apis/User";
import { useUserStore } from "@/store/user";
import { useEffect } from "react";


export const useUser = () => {
    const { user, setUser } = useUserStore();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        if (user) {
            return;
        }
        getCurrentUser().then(result => {
            setUser(result);
        });
    }

    return user;
}