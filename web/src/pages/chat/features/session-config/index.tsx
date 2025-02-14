import { Flexbox } from 'react-layout-kit';
import { useChatStore } from '@/store/chat';
import { useStyles } from './styles';
import { Button, Divider, Input, Select } from 'antd';
import { CircleSlash, X } from 'lucide-react';


export default function SessionConfig() {
    const { styles, cx } = useStyles();
    const [
        sessionConfigExpanded,
        setExpanded
    ] = useChatStore(state => [state.sessionConfigExpanded, state.setSessionConfigExpanded]);

    return <Flexbox style={{
        width: sessionConfigExpanded ? 280 : 0,
        marginRight: 10,
        marginBottom: 10,
        right: 0,
        borderRadius: 8,
        padding: 10,
        transition: 'width 0.3s',
        height: 'calc(100vh - 85px)',
    }}
        className={cx(styles.container, sessionConfigExpanded ? styles.expanded : styles.collapsed)}
    >
        <Flexbox>
            <Flexbox style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
            }}
                horizontal
            >
                <span>会话设置</span>
                <Button
                    shape="circle"
                    type="text"
                    size="small"
                    onClick={() => {
                        setExpanded(false);
                    }}
                >
                    <X />
                </Button>
            </Flexbox>
            <Divider />
            <Flexbox style={{
                flexDirection: 'column',
                gap: 10,
            }}>
                <Flexbox style={{
                    flexDirection: 'column',
                    gap: 5,
                }}>
                    <span>会话名称</span>
                    <Input
                        placeholder="请输入会话名称"
                    />
                </Flexbox>
            </Flexbox>

        </Flexbox>
    </Flexbox>
}