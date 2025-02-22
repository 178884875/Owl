import { Flexbox } from "react-layout-kit";
import { Button, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useChatStore } from "@/store/chat";
import { clearHistoryMessages } from "@/apis/Session";


export default function Clear() {
    const [setFiles, setMessages, currentSession] = useChatStore(state => [state.setFiles, state.setMessages, state.currentSession]);
    return <Flexbox
        horizontal
    >
        <Popconfirm
            title="确定清空对话吗, 清空后无法恢复"
            onConfirm={async () => {
                await clearHistoryMessages(currentSession?.id);
                setFiles([]);
                setMessages([]);
                message.success('清空成功');
            }}
        >
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
            />
        </Popconfirm>
    </Flexbox>;
}

