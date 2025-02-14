import { get } from "../utils/fetch";

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return get('/api/User/CurrentUser')
}