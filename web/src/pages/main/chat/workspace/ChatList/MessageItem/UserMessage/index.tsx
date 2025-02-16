import { Bubble } from "@ant-design/x";
import { SyncOutlined, CopyOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, message } from "antd";
import { Flexbox } from "react-layout-kit";
import { useUser } from "@/hooks/useUser";

export interface UserMessageProps {
    text: string;
    loading?: boolean;
    triggerText?: (index: number) => void;
    currentIndex?: number;
    indexTotal: number;
    onDeleted?: () => void;
}

export default function UserMessage({
    text,
    loading,
    triggerText,
    currentIndex,
    indexTotal,
    onDeleted
}: UserMessageProps) {
    const user = useUser();

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
                src={user?.avatar}
                size={32}
            />}
            loading={loading}
            header={user?.displayName}
            footer={
                <Flexbox>
                    {indexTotal > 1 && (
                        <Button color="default" variant="text" size="small" onClick={() => triggerText && triggerText(currentIndex! - 1)} icon={<SyncOutlined />} />
                    )}
                    <Flexbox
                        horizontal>
                        <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
                        <Button color="default"
                            onClick={handleCopy}
                            variant="text" size="small" icon={<CopyOutlined />} />
                    </Flexbox>
                </Flexbox>
            }
        />
    </Dropdown>)
}