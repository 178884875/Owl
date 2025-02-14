import { useChatStore } from "@/store/chat";
import { Button } from "antd";
import { Bolt, MessageSquarePlus } from "lucide-react";
import { Flexbox } from "react-layout-kit";
import { useStyles } from "./styles";


export default function Title() {

    const [
        expanded,
        setExpanded
    ] = useChatStore(state => [state.sessionConfigExpanded, state.setSessionConfigExpanded]);

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
                    flex: 1,
                }}>

                </Flexbox>
                <Button
                    onClick={() => setExpanded(!expanded)}
                    shape="circle"
                    type="text"
                    size="large"
                    aria-label="打开会话设置"
                    className={cx((expanded) && styles.active)}
                >
                    <Bolt />
                </Button>
                <Button
                    shape="circle"
                    type="text"
                    size="large"
                    aria-label="新建会话"
                >
                    <MessageSquarePlus />
                </Button>
            </Flexbox>
        </>
    )
}
