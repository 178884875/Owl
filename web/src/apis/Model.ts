import { get } from "@/utils/fetch";


/**
 * 获取可用的模型列表
 */
export default function getModels(){
    return get('/api/Model/Models')
} 