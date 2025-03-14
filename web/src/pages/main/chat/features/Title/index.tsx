import { useChatStore } from "@/store/chat";
import { Button, Tag, Tooltip } from "antd";
import { Bolt, MessageSquarePlus } from "lucide-react";
import { Flexbox } from "react-layout-kit";
import { useStyles } from "./styles";
export default function Title() {
    const isChat = window.location.pathname.startsWith('/chat');
    const [
        expanded,
        setExpanded,
        createSessionVisible,
        currentSession
    ] = useChatStore(state => [state.sessionConfigExpanded, state.setSessionConfigExpanded, state.setCreateSessionVisible, state.currentSession]);


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
                <Flexbox
                    horizontal
                    style={{
                        flex: 1,
                        gap: 5,
                        marginLeft: 10,
                    }}>

                    <Flexbox style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        maxWidth: '200px',
                    }}>
                        <Tooltip title={currentSession?.name}>
                            {currentSession?.name}
                        </Tooltip>
                    </Flexbox>
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
