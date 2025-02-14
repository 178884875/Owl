import { getCurrentUser } from "@/apis/User";
import { UserDto } from "@/types/User";
import { useEffect, useState } from "react";


export const useUser = () => {
    const [user, setUser] = useState<UserDto | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        // Load user from API
        getCurrentUser().then(result => {
            setUser(result);
        });
    }

    return user;
}