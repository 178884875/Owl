import { del, get, postJson, putJson } from "@/utils/fetch";

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
    const res = await putJson('/api/modelChannel', data);
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
 * @param data 邀请码数据
 * @returns 加入渠道的响应数据
 */
export const joinChannel = async (data: any) => {
    const res = await postJson('/api/modelChannel/joinInviteCode', data);
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



