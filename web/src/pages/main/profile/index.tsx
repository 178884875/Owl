import { theme, Card, Avatar, Badge, Descriptions, Button, Divider, Space, Typography, Row, Col } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUser';
import { Flexbox } from 'react-layout-kit';

const { useToken } = theme;
const { Title, Text } = Typography;

export default function Profile() {
    const user = useUser();
    const { token } = useToken();
    return (
        <Flexbox style={{
            height: '100vh',
            width: '100%',
            backgroundColor: token.colorBgBase,
            padding: '20px'
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '800px',
                borderRadius: '12px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                margin: "auto"
            }}
            actions={[
                <Button type="primary" icon={<EditOutlined />} key="edit">编辑资料</Button>
            ]}>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                        <Avatar
                            size={120}
                            src={user?.avatar}
                            icon={<UserOutlined />}
                            style={{ 
                                border: `4px solid ${token.colorPrimary}`,
                                padding: 2,
                                backgroundColor: token.colorBgContainer
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Badge 
                                status={user?.enabled ? "success" : "error"} 
                                text={
                                    <Text style={{ fontSize: '16px' }}>
                                        {user?.enabled ? "已启用" : "已禁用"}
                                    </Text>
                                } 
                            />
                        </div>
                    </Col>
                    
                    <Col xs={24} sm={16}>
                        <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
                            {user?.displayName}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>@{user?.userName}</Text>
                        
                        <Divider style={{ margin: '16px 0' }} />
                        
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Space>
                                <MailOutlined style={{ color: token.colorPrimary }} />
                                <Text strong>电子邮箱:</Text>
                                <Text>{user?.email}</Text>
                            </Space>
                            
                            <Space>
                                <PhoneOutlined style={{ color: token.colorPrimary }} />
                                <Text strong>电话号码:</Text>
                                <Text>{user?.phone || '未设置'}</Text>
                            </Space>
                            
                            <Space>
                                <CalendarOutlined style={{ color: token.colorPrimary }} />
                                <Text strong>注册时间:</Text>
                                <Text>{user?.createdAt || '2023-01-01'}</Text>
                            </Space>
                        </Space>
                    </Col>
                </Row>
                
                <Divider orientation="left">详细信息</Divider>
                
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="用户名">{user?.userName}</Descriptions.Item>
                    <Descriptions.Item label="显示名称">{user?.displayName}</Descriptions.Item>
                    <Descriptions.Item label="账户状态">{user?.enabled ? "正常" : "已禁用"}</Descriptions.Item>
                    <Descriptions.Item label="电子邮箱">{user?.email}</Descriptions.Item>
                    <Descriptions.Item label="电话号码">{user?.phone || '未设置'}</Descriptions.Item>
                    <Descriptions.Item label="用户角色">{user?.role || '普通用户'}</Descriptions.Item>
                </Descriptions>
            </Card>
        </Flexbox>
    );
}