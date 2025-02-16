import { Avatar, Button, Dropdown, message } from 'antd';
import { SyncOutlined, CopyOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Flexbox } from 'react-layout-kit';

export interface AssistantMessageProps {
    text: string;
    loading?: boolean;
    triggerText?: (index: number) => void;
    currentIndex?: number;
    indexTotal: number;
    onDeleted?: () => void;
}


export default function AssistantMessage({
    text,
    loading,
    triggerText,
    currentIndex,
    indexTotal,
    onDeleted
}: AssistantMessageProps) {

    function handleCopy() {
        navigator.clipboard.writeText(text.trim())
            .then(() => {
                message.success('复制成功')
            }).catch(() => {
                message.error('复制失败。')
            })
    }


    return (<Dropdown
        trigger={['contextMenu']}
        menu={{
            items: [
                {
                    key: 'rename',
                    label: '编辑',
                    onClick: () => {
                    }
                },
                {
                    key: 'delete',
                    label: '删除',
                    style: { color: 'red' },
                    onClick: () => {
                        onDeleted && onDeleted();
                    }
                }
            ]
        }}
    >
        <Bubble
            content={text}
            role="user"
            avatar={<Avatar
                src={'🤖'}
                size={32}
            />}
            loading={loading}
            header={'Thor'}
            footer={
                <Flexbox>
                    {indexTotal > 1 && (
                        <Button color="default" variant="text" size="small" onClick={() => triggerText && triggerText(currentIndex! - 1)} icon={<SyncOutlined />} />
                    )}
                    <Flexbox
                        horizontal>
                        <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
                        <Button
                            onClick={handleCopy}
                            color="default" variant="text" size="small" icon={<CopyOutlined />} />
                    </Flexbox>
                </Flexbox>
            }
        />
    </Dropdown>)
}