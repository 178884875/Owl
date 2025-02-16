import { useChatStore } from "@/store/chat";
import { chatSelectors } from "@/store/chat/selectors";
import { Bubble } from "@ant-design/x";
import { Flexbox } from "react-layout-kit";
import { UserOutlined, SyncOutlined, CopyOutlined } from "@ant-design/icons";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import ToolsMessage from "./ToolsMessage";
import { useState } from "react";
import { message } from "antd";


export interface MessageItemProps {
    id: number;
}

export default function MessageItem(
    {
        id,
    }: MessageItemProps
) {
    const [item, deleteMessage] = useChatStore(state => [chatSelectors.getMessagesBySessionId(state, id), state.deleteMessage]);
    // 当前文本索引
    const [currentIndex, setCurrentIndex] = useState(item.texts.length - 1);

    const renderMessage = (role: string, content: string) => {
        switch (role) {
            case 'user':
                return <UserMessage
                    currentIndex={currentIndex}
                    indexTotal={item.texts.length}
                    triggerText={(index) => setCurrentIndex(index)}
                    onDeleted={async () => {
                        await deleteMessage(id)
                        message.success('删除成功');
                    }}
                    text={content} />
            case 'assistant':
                return <AssistantMessage
                    currentIndex={currentIndex}
                    onDeleted={async () => {
                        await deleteMessage(id);
                        message.success('删除成功');
                    }}
                    indexTotal={item.texts.length}
                    triggerText={(index) => setCurrentIndex(index)}
                    text={content} />
            case 'tools':
                return <ToolsMessage text={content} />
            default:
                return <Bubble
                    content={content}
                    avatar={{ icon: <UserOutlined /> }}
                    header="Default"
                    footer={
                        <Flexbox>
                            <SyncOutlined />
                            <CopyOutlined />
                        </Flexbox>
                    }
                />
        }
    }

    return <Flexbox
        horizontal
    >
        {renderMessage(item.role, item.texts[currentIndex].text)}
    </Flexbox>
}