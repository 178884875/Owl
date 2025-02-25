import { useChatStore } from "@/store/chat";
import { Button, Tooltip } from "antd";
import { Bolt, MessageSquarePlus } from "lucide-react";
import { Flexbox } from "react-layout-kit";
import { useStyles } from "./styles";
import { chatSelectors } from "@/store/chat/selectors";
export default function Title() {
    const isChat = window.location.pathname.startsWith('/chat');
    const [
        expanded,
        setExpanded,
        createSessionVisible,
        model,
        currentSession
    ] = useChatStore(state => [state.sessionConfigExpanded, state.setSessionConfigExpanded, state.setCreateSessionVisible, chatSelectors.getCurrentModel(state), state.currentSession]);


    const { styles, cx } = useStyles();

    return (
        <>
            <Flexbox style={{
                height: '46px',
                maxHeight: '46px',
                padding: '5px 5px',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 5,

            }}
                horizontal
            >
                <Flexbox style={{
                    marginLeft: 10,
                    width: 180,
                    fontSize: 14,
                }}>
                    <Tooltip title={model?.description}>
                        {model?.displayName}
                    </Tooltip>
                </Flexbox>
                <Flexbox style={{
                    flex: 1,
                    textAlign: 'center',
                    // 超出显示省略号
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: 100,
                }}>
                    {currentSession?.name}
                </Flexbox>
                {isChat && <Button
                    onClick={() => setExpanded(!expanded)}
                    shape="circle"
                    type="text"
                    size="large"
                    aria-label="打开会话设置"
                    className={cx((expanded) && styles.active)}
                >
                    <Bolt />
                </Button>}
                <Button
                    shape="circle"
                    type="text"
                    size="large"
                    onClick={() => createSessionVisible(true)}
                    aria-label="新建会话"
                >
                    <MessageSquarePlus />
                </Button>
            </Flexbox>
        </>
    )
}
