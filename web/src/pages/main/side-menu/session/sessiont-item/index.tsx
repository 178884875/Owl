import { Flexbox } from 'react-layout-kit';
import { chatSelectors } from '../../../../../store/chat/selectors';
import { useChatStore } from '../../../../../store/chat';
import { clearHistoryMessages } from '@/apis/Session';

import { useStyles } from './style';
import { Dropdown, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { useCallback, useMemo } from 'react';

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
    const { styles, cx } = useStyles();
    
    // Memoize selectors to prevent unnecessary re-renders
    const session = useChatStore(state => chatSelectors.getSessionById(state, id));
    const isCurrentSession = useChatStore(state => chatSelectors.isCurrentSession(state, id));
    const sideBarExpanded = useChatStore(state => state.sideBarExpanded);
    
    // Get functions from store without causing re-renders
    const { selectSession, deleteSession, renameSession, toggleFavorite } = useMemo(() => {
        const state = useChatStore.getState();
        return {
            selectSession: state.selectSession,
            deleteSession: state.deleteSession,
            renameSession: state.renameSession,
            toggleFavorite: state.toggleFavorite
        };
    }, []);
    
    // Use callbacks for event handlers
    const handleToggleFavorite = useCallback(async () => {
        await toggleFavorite(id);
        message.success(session?.favorite ? '已取消收藏' : '已收藏');
    }, [id, session?.favorite, toggleFavorite]);
    
    const handleRename = useCallback(async () => {
        await renameSession(id);
    }, [id, renameSession]);
    
    const handleClearHistory = useCallback(async () => {
        await clearHistoryMessages(id);
        message.success('清空成功');
    }, [id]);
    
    const handleDelete = useCallback(async () => {
        await deleteSession(id);
        if (isCurrentSession) {
            navigator('/');
        }
    }, [deleteSession, id, isCurrentSession, navigator]);
    
    const handleSelectSession = useCallback(() => {
        selectSession(id);
        navigator(`/chat?sessionId=${id}`);
    }, [id, navigator, selectSession]);
    
    // Memoize menu items to prevent re-creation on every render
    const menuItems = useMemo(() => [
        {
            key: 'favorite',
            label: session?.favorite ? '取消收藏' : '收藏会话',
            icon: session?.favorite ? <StarFilled /> : <StarOutlined />,
            onClick: handleToggleFavorite
        },
        {
            key: 'rename',
            label: '智能重命名',
            onClick: handleRename
        },
        {
            key: 'clearHistory',
            label: '清空历史',
            style: {
                color: 'red'
            },
            onClick: handleClearHistory
        },
        {
            key: 'delete',
            label:
                <Popconfirm
                    title="删除会话"
                    description="确认删除会话吗？ 删除后将无法恢复。"
                    onConfirm={handleDelete}
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
    ], [session?.favorite, handleToggleFavorite, handleRename, handleClearHistory, handleDelete]);

    if (!sideBarExpanded) return null;

    return (
        <Dropdown
            trigger={['contextMenu']}
            menu={{
                items: menuItems
            }}
        >
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
                onClick={handleSelectSession}
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
            </Flexbox>
        </Dropdown>
    )
}