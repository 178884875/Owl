

export enum ChatRole {
    User = "user",
    System = "system",
    Assistant = "assistant",
}


export interface ChatCompleteParams {
    sessionId: number;
    parentId: number | null;
    text: string;
    fileIds: string[];
    assistantMessageId: number;
    functionCalls: string[];
    networking: boolean;
  }