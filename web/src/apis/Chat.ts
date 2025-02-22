import { ChatCompleteParams } from '@/types/Chat';
import { fetchSSE, post } from '../utils/fetch';

export async function* chatComplete(params: ChatCompleteParams): AsyncIterableIterator<any> {
  const url = '/api/Chat/ChatComplete';
  yield* fetchSSE(url, params);
}

export async function generateSessionName(sessionId: number): Promise<any> {
  const url = `/api/Chat/GenerateSessionName?sessionId=${sessionId}`;
  return await post(url);
}
