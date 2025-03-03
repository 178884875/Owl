import { get, post, postJson, putJson } from "@/utils/fetch";


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


/**
 * 创建模型
 * @param model 模型数据对象，包含provider、modelId、displayName等必要信息
 * @returns 服务器响应
 */
export function createModel(model: any){
    return postJson('/api/Model', model)
}


/**
 * 更新模型
 * @param model 
 * @returns 
 */
export function updateModel(model: any){
    return putJson('/api/Model', model)
}

/**
 * 获取当前用户可用模型列表
 */
export function getCurrentUserModels(){
    return get('/api/Model/CurrentUserModels')
}

