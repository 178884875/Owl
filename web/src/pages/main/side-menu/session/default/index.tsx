import { useChatStore } from "@/store/chat";
import { Flexbox } from "react-layout-kit";
import {
    theme,
    Typography
} from "antd";
import { MessageOutlined } from '@ant-design/icons';

const {
    useToken
} = theme;
const { Text } = Typography;

export default function DefaultSession() {
    const { token } = useToken();

    const [
        sideBarExpanded
    ] = useChatStore(state => [state.sideBarExpanded]);

    return (
        <>
            {sideBarExpanded && (
                <Flexbox
                    style={{
                        padding: 16,
                        width: '100%',
                        height: 'auto',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: token.colorTextDescription,
                        userSelect: 'none',
                    }}
                    gap={16}
                >
                    <MessageOutlined style={{ fontSize: 32, opacity: 0.8 }} />
                    <Text style={{ fontSize: 16, textAlign: 'center' }}>暂无聊天会话</Text>
                    <Text type="secondary" style={{ fontSize: 14, textAlign: 'center', padding: '0 10px' }}>
                        在右侧面板开始一个新的对话
                    </Text>
                </Flexbox>
            )}
        </>
    )
}