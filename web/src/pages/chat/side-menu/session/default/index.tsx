import { Flexbox } from "react-layout-kit";
import { useStyles } from "../sessiont-item/style";
import { useChatStore } from "../../../../../store/chat";
import { Avatar, Divider, Tooltip } from "antd";
import { chatSelectors } from "../../../../../store/chat/selectors";
import { Shell } from "lucide-react";

export default function DefaultSession() {

    const { styles, cx } = useStyles();
    const [
        currentSession,
        selectSession,
        sideBarExpanded
    ] = useChatStore(state => [chatSelectors.isCurrentSession(state, -1), state.selectSession, state.sideBarExpanded]);



    return (
        <>
            <Tooltip
                // 如果侧边栏展开，则不显示提示
                trigger={sideBarExpanded ? [] : ['hover']}
                placement={'right'}
                title={'默认会话'}
            >
                <Flexbox
                    distribution={'space-between'}
                    gap={8}
                    key={-1}
                    className={cx(styles.container, currentSession && styles.active)}
                    padding={12}
                    style={{
                        cursor: 'pointer',
                        width: 'auto',
                        borderRadius: 8,
                    }}
                    onClick={() => {
                        selectSession(-1);
                    }}
                    horizontal
                    align={'flex-start'}
                >
                    <Shell
                        size={32}
                    />
                    {sideBarExpanded &&
                        <Flexbox
                            className={styles.content}
                            style={{
                                transition: 'width 0.3s',
                            }}
                        >
                            <Flexbox
                                distribution={'space-between'}
                            >
                                <span>
                                    默认会话
                                </span>
                                <span className={cx(styles.time)}>
                                    默认对话会话，快速开始聊天。
                                </span>
                            </Flexbox>
                        </Flexbox>}
                </Flexbox>
            </Tooltip>
            <Divider />
        </>
    )
}