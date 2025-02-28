import { del, get, post, postJson, putJson } from "@/utils/fetch";

/**
 * 获取渠道列表
 * @returns 渠道列表的响应数据
 */
export const getChannelList = async () => {
    const res = await get('/api/modelChannel/list');
    return res;
}

/**
 * 创建新渠道
 * @param data 渠道数据
 * @returns 创建渠道的响应数据
 */
export const createChannel = async (data: any) => {
    const res = await postJson('/api/modelChannel', data);
    return res;
}

/**
 * 更新现有渠道
 * @param data 渠道数据
 * @returns 更新渠道的响应数据
 */
export const updateChannel = async (data: any) => {
    const res = await putJson(`/api/modelChannel?id=${data.id}`, data);
    return res;
}

/**
 * 删除指定渠道
 * @param id 渠道ID
 * @returns 删除渠道的响应数据
 */
export const deleteChannel = async (id: number) => {
    const res = await del(`/api/modelChannel?id=${id}`);
    return res;
}

/**
 * 获取渠道详细信息
 * @param id 渠道ID
 * @returns 渠道详情的响应数据
 */
export const getChannelDetail = async (id: number) => {
    const res = await get(`/api/modelChannel?id=${id}`);
    return res;
}

/**
 * 创建渠道邀请码
 * @param data 邀请码数据
 * @returns 创建邀请码的响应数据
 */
export const createChannelInviteCode = async (data: any) => {
    const res = await postJson('/api/modelChannel/inviteCode', data);
    return res;
}

/**
 * 获取邀请码列表
 * @returns 邀请码列表的响应数据
 */
export const getInviteCodeList = async (channelId: number) => {
    const res = await get(`/api/modelChannel/inviteCodeList?channelId=${channelId}`);
    return res;
}

/**
 * 删除渠道邀请码
 * @param id 邀请码ID
 * @returns 删除邀请码的响应数据
 */
export const deleteChannelInviteCode = async (id: number) => {
    const res = await del(`/api/modelChannel/inviteCode?id=${id}`);
    return res;
}

/**
 * 使用邀请码加入渠道
 * @param code 邀请码
 * @returns 加入渠道的响应数据
 */
export const joinChannel = async (code: string) => {
    const res = await post(`/api/modelChannel/joinInviteCode?code=${code}`);
    return res;
}

/**
 * 删除渠道共享用户
 * @param id 用户ID
 * @returns 删除共享用户的响应数据
 */
export const deleteChannelShare = async (id: number) => {
    const res = await del(`/api/modelChannel/shareUser?id=${id}`);
    return res;
}

/**
 * 获取渠道共享用户列表
 * @param id 渠道ID
 * @returns 渠道共享用户列表的响应数据
 */
export const getChannelShareList = async (id: number) => {
    const res = await get(`/api/modelChannel/shareUserList?channelId=${id}`);
    return res;
}


/**
 * 更新渠道密钥
 * @param data 密钥数据
 * @returns 更新密钥的响应数据
 */
export const updateChannelKey = async (id: number, data: any) => {
    const res = await putJson(`/api/modelChannel/Keys?id=${id}`, data);
    return res;
}

/**
 * 获取密钥
 * 
 */
export const getChannelKey = async (id: number) => {
    const res = await get(`/api/modelChannel/Keys?id=${id}`);
    return res;
}


/**
 * 测试渠道
 * @param id 渠道ID
 * @returns 测试渠道的响应数据
 */
export const testChannel = async (id: number) => {
    const res = await post(`/api/modelChannel/test?id=${id}`);
    return res;
}


/**
 * 禁用指定渠道的分享用户
 * @param id 
 * @returns 
 */
export const enableShareUser = async (id: number) => {
    const res = await post(`/api/modelChannel/enableShareUser?id=${id}`);
    return res;
}

