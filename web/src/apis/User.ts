import { ChangePasswordDto } from "@/types/User";
import { get, del, postJson, post, putJson } from "../utils/fetch";

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return get('/api/User/CurrentUser')
}

/**
 * 获取用户提示列表
 */
export const getUserPrompts = () => {
  return get('/api/User/UserPrompts')
}

/**
 * 创建用户提示
 */
export const createUserPrompt = (data: any) => {
  return postJson('/api/User/UserPrompt', data)
}

/**
 * 删除用户提示
 */
export const deleteUserPrompt = (id: number) => {
  return del(`/api/User/UserPrompt?id=${id}`)
}

/**
 * 更新用户提示
 */
export const updateUserPrompt = (data: any) => {
  return putJson('/api/User/UserPrompt', data)
}

/**
 * 获取用户列表
 */
export const getUserList = (search?: string, page?: number, size?: number) => {
  return get(`/api/User/List?search=${search}&page=${page}&size=${size}`)
}

/**
 * 删除用户
 */
export const deleteUser = (id: string) => {
  return del(`/api/User?id=${id}`)
}


/**
 * 添加用户
 */
export const addUser = (user: any) => {
  return postJson('/api/User', user)
}

/**
 * 更新用户
 */
export const updateUser = (user: any) => {
  return postJson('/api/User', user)
}

/**
 * 启用用户
 */
export const enableUser = (id: string) => {
  return post(`/api/User/Enable?id=${id}&enable=true`)
}

/**
 * 禁用用户
 */
export const disableUser = (id: string) => {
  return post(`/api/User/Enable?id=${id}&enable=false`)
}

/**
 * 重置密码
 */
export const resetPassword = (data: any) => {
  return postJson('/api/User/ResetPassword', data)
}

/**
 * 修改当前用户密码
 */
export const ChangePassword = (data: ChangePasswordDto) => {
  return postJson('/api/User/ChangePassword', data)
}

