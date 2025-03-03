import { Flexbox } from 'react-layout-kit';
import { chatSelectors } from '../../../../../store/chat/selectors';
import { useChatStore } from '../../../../../store/chat';
import { clearHistoryMessages } from '@/apis/Session';

import { useStyles } from './style';
import { Dropdown, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { StarFilled, StarOutlined } from '@ant-design/icons';

export interface SessionItemProps {
    id: number;
    classNames?: {
        time?: string;
    };
}

export default function SessionItem({
    id
}: SessionItemProps) {
    const navigator = useNavigate();
    const [
        session,
        isCurrentSession,
        selectSession,
        deleteSession,
        renameSession,
        sideBarExpanded,
        toggleFavorite
    ] =
        useChatStore(state => [
            chatSelectors.getSessionById(state, id),
            chatSelectors.isCurrentSession(state, id),
            state.selectSession,
            state.deleteSession,
            state.renameSession,
            state.sideBarExpanded,
            state.toggleFavorite]);

    const { styles, cx } = useStyles();

    return (
        <Dropdown
            trigger={['contextMenu']}
            menu={{
                items: [
                    {
                        key: 'favorite',
                        label: session?.favorite ? '取消收藏' : '收藏会话',
                        icon: session?.favorite ? <StarFilled /> : <StarOutlined />,
                        onClick: async () => {
                            await toggleFavorite(id);
                            message.success(session?.favorite ? '已取消收藏' : '已收藏');
                        }
                    },
                    {
                        key: 'rename',
                        label: '智能重命名',
                        onClick: async () => {
                            await renameSession(id);
                        }
                    },
                    {
                        key: 'clearHistory',
                        label: '清空历史',
                        style: {
                            color: 'red'
                        },
                        onClick: async () => {
                            await clearHistoryMessages(id);
                            message.success('清空成功');
                        }
                    },
                    {
                        key: 'delete',
                        label:
                            <Popconfirm
                                title="删除会话"
                                description="确认删除会话吗？ 删除后将无法恢复。"
                                onConfirm={async () => {
                                    await deleteSession(id);
                                    if (isCurrentSession) {
                                        navigator('/')
                                    }
                                }}
                                okText="确认"
                                cancelText="取消"
                            >
                                <Flexbox style={{
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'red',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    minWidth: 60,
                                }}>
                                    删除
                                </Flexbox>
                            </Popconfirm>,
                        style: {
                            color: 'red'
                        }
                    }
                ]
            }}
        >
            {sideBarExpanded &&
                <Flexbox
                    distribution={'space-between'}
                    key={id}
                    className={cx(
                        styles.container, 
                        isCurrentSession && styles.active,
                        session?.favorite && styles.favorite
                    )}
                    padding={5}
                    style={{
                        cursor: 'pointer',
                        width: 'auto',
                        borderRadius: 8,
                        position: 'relative',
                    }}
                    onClick={() => {
                        selectSession(id);
                        navigator(`/chat?sessionId=${id}`);
                    }}
                    horizontal
                    align={'flex-start'}
                >
                    {session?.favorite && (
                        <div className={styles.favoriteMarker}>
                            <StarFilled style={{ fontSize: 12, color: '#fadb14' }} />
                        </div>
                    )}
                    <Flexbox
                        className={styles.content}
                    >
                        <Flexbox
                            distribution={'space-between'}
                        >
                            <span style={{
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                maxWidth: '100%',
                                fontSize: 12,
                                fontWeight: 500
                            }}>{session?.name}</span>
                            <span className={cx(styles.time)}>
                                {session?.createdAtName}
                            </span>
                        </Flexbox>
                    </Flexbox>
                </Flexbox>}
        </Dropdown>
    )
}