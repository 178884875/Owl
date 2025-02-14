import { Flexbox } from 'react-layout-kit';
import { chatSelectors } from '../../../../../store/chat/selectors';
import { useChatStore } from '../../../../../store/chat';


import { useStyles } from './style';
import { Avatar, Dropdown, Popconfirm } from 'antd';

export interface SessionItemProps {
    id: number;
    classNames?: {
        time?: string;
    };
}

export default function SessionItem({
    id
}: SessionItemProps) {
    const [
        session,
        isCurrentSession,
        selectSession
    ] = useChatStore(state => [chatSelectors.getSessionById(state, id), chatSelectors.isCurrentSession(state, id), state.selectSession]);

    const { styles, cx } = useStyles();


    return (
        <Dropdown
            trigger={['contextMenu']}
            menu={{
                items: [
                    {
                        key: 'rename',
                        label: '重命名',
                        onClick: () => {
                        }
                    },
                    {
                        key: 'delete',
                        label:
                            <Popconfirm
                                title="删除会话"
                                description="确认删除会话吗？ 删除后将无法恢复。"
                                onConfirm={() => {
                                    console.log('删除')
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
                }}
                horizontal
                align={'flex-start'}
            >
                <Avatar src={session?.avatar} />
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
            </Flexbox>
        </Dropdown>
    )
}