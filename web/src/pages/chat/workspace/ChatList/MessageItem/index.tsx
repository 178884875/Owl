import { useChatStore } from "@/store/chat";
import { chatSelectors } from "@/store/chat/selectors";


export interface MessageItemProps {
    id: number;
}

export default function MessageItem(
    {
        id,
    }: MessageItemProps
) {
    const { message } = useChatStore(state => chatSelectors.getMessagesBySessionId(state, id));

    return <>

    </>
}