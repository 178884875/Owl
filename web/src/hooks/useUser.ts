import { getCurrentUser } from "@/apis/User";
import { useUserStore } from "@/store/user";
import { useEffect } from "react";

// 使用模块级变量跟踪请求状态
let isLoading = false;
let loadingPromise: Promise<any> | null = null;

export const useUser = () => {
    const { user, setUser } = useUserStore();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        // 如果已经有用户数据，直接返回
        if (user) {
            return;
        }
        
        // 如果已经在加载中，不再发起新请求
        if (isLoading) {
            return loadingPromise;
        }
        
        // 设置加载状态并保存Promise
        isLoading = true;
        loadingPromise = getCurrentUser().then(result => {
            setUser(result.data);
            return result.data;
        }).finally(() => {
            isLoading = false;
            loadingPromise = null;
        });
        
        return loadingPromise;
    }

    return user;
}