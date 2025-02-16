
import { Bubble } from '@ant-design/x';
import { Avatar, Button } from 'antd';
import { Flexbox } from 'react-layout-kit';
import { SyncOutlined, CopyOutlined } from '@ant-design/icons';

export interface ToolsMessageProps {
    text: string;
    loading?: boolean;
}

export default function ToolsMessage({
    text,
    loading
}: ToolsMessageProps) {

    return (<Bubble
        content={text}
        role="user"
        avatar={<Avatar
            src={'🛠'}
            size={32}
        />}
        loading={loading}
        header={'Tools'}
        footer={
            <Flexbox
                horizontal>
                <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
                <Button color="default" variant="text" size="small" icon={<CopyOutlined />} />
            </Flexbox>
        }
    />)
}