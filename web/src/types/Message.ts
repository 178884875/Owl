export interface UpdateMessage {
    texts: MessageTextInput[];
}

export interface MessageTextInput {
    id: number;
    text: string;
}