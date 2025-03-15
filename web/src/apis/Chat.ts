import { ChatCompleteParams } from '@/types/Chat';
import { fetchSSE, post, postJson } from '../utils/fetch';

export async function* chatComplete(params: ChatCompleteParams): AsyncIterableIterator<any> {
  const url = '/api/Chat/ChatComplete';
  yield* fetchSSE(url, params);
}

export async function generateSessionName(sessionId: number): Promise<any> {
  const url = `/api/Chat/GenerateSessionName?sessionId=${sessionId}`;
  return await post(url);
}

export async function generatePrompt(data: any): Promise<any> {
  const url = `/api/Chat/GeneratePrompt`;
  return await postJson(url, data);
}
