import { ChatCompleteParams } from '@/types/Chat';
import { fetchSSE } from '../utils/fetch';

export async function* chatComplete(params: ChatCompleteParams): AsyncIterableIterator<any> {
  const url = '/api/Chat/ChatComplete';
  yield* fetchSSE(url, params);
}
