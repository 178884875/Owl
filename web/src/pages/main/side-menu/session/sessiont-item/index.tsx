import { Flexbox } from 'react-layout-kit';
import { chatSelectors } from '../../../../../store/chat/selectors';
import { useChatStore } from '../../../../../store/chat';
import { clearHistoryMessages } from '@/apis/Session';

import { useStyles } from './style';
import { Dropdown, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
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
        sideBarExpanded
    ] =
        useChatStore(state => [
            chatSelectors.getSessionById(state, id),
            chatSelectors.isCurrentSession(state, id),
            state.selectSession,
            state.deleteSession,
            state.renameSession,
            state.sideBarExpanded]);

    const { styles, cx } = useStyles();

    return (
        <Dropdown
            trigger={['contextMenu']}
            menu={{
                items: [
                    {
                        key: 'rename',
                        label: '重命名',
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
                                删除
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
                    gap={8}
                    key={id}
                    className={cx(styles.container, isCurrentSession && styles.active)}
                    padding={12}
                    style={{
                        cursor: 'pointer',
                        width: 'auto',
                        borderRadius: 8,
                    }}
                    onClick={() => {
                        selectSession(id);
                        navigator(`/chat?sessionId=${id}`);
                    }}
                    horizontal
                    align={'flex-start'}
                >
                    <Flexbox
                        className={styles.content}
                    >
                        <Flexbox
                            distribution={'space-between'}
                        >
                            <span>{session?.name}</span>
                            <span className={cx(styles.time)}>
                                {session?.createdAtName}
                            </span>
                        </Flexbox>
                    </Flexbox>
                </Flexbox>}
        </Dropdown>
    )
}