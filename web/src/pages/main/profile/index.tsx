import {theme, Card, Avatar, Badge, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUser';
import { Flexbox } from 'react-layout-kit';

const { useToken } = theme;

export default function Profile() {
    const user = useUser();
    const { token } = useToken();
    return (
        <Flexbox style={{
            height: '100vh',
            width: '100%',
            backgroundColor: token.colorBgBase
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '600px',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                margin: "auto"
            }}>
                <Card.Meta
                    avatar={
                        <Avatar
                            size={64}
                            src={user.avatar}
                            icon={<UserOutlined />}
                        />
                    }
                    title={
                        <div>
                            <span className="text-2xl">{user.displayName}</span>
                            <div className="mt-2">
                                <Badge status={user.enabled ? "success" : "error"} text={user.enabled ? "已启用" : "已禁用"} />
                            </div>
                        </div>
                    }
                />
                <Descriptions column={{ xs: 1, sm: 2 }} className="mt-4">
                    <Descriptions.Item label="用户名">{user.userName}</Descriptions.Item>
                    <Descriptions.Item label="显示名称">{user.displayName}</Descriptions.Item>
                    <Descriptions.Item label="电子邮箱">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="电话号码">{user.phone || '未设置'}</Descriptions.Item>
                </Descriptions>
            </Card>
        </Flexbox>
    );
}