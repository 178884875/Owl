import { get, post } from "@/utils/fetch";


/**
 * 获取可用的模型列表
 */
export default function getModels(){
    return get('/api/Model/Models')
} 

/**
 * 获取所有模型列表
 */
export function getModelList(){
    return get('/api/Model/List')
}

export function enableModel(modelId: string){
    return post(`/api/Model/Enable?id=${modelId}`)
}



