import { Layout, Typography, Card, Row, Col, Timeline, Divider, Tag, Space, Button } from 'antd';
import {
    ThunderboltOutlined,
    ApiOutlined,
    CloudServerOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    RocketOutlined,
    GithubOutlined,
    ReadOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { GITHUB_URL } from '@/consts/app';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

export default function About() {
    const navigate = useNavigate();
    const features = [
        {
            title: '多渠道支持',
            description: '除OpenAI外，支持多种AI对话模型接入，灵活配置不同渠道',
            icon: <ApiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
            color: '#e6f7ff'
        },
        {
            title: '企业级架构',
            description: '基于.NET构建的高性能后端，采用企业级设计模式和最佳实践',
            icon: <CloudServerOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
            color: '#f6ffed'
        },
        {
            title: 'React前端',
            description: '现代化的React技术栈，提供流畅的用户体验和响应式设计',
            icon: <ThunderboltOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
            color: '#fffbe6'
        },
        {
            title: '安全可靠',
            description: '企业级的安全设计，数据加密传输，完善的权限管理',
            icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
            color: '#fff0f6'
        }
    ];

    const techStack = [
        {
            title: '后端技术',
            icon: <RocketOutlined style={{ color: '#1890ff' }} />,
            items: ['.NET Core', 'Entity Framework', 'Redis'],
            color: 'blue'
        },
        {
            title: '前端技术',
            icon: <ThunderboltOutlined style={{ color: '#52c41a' }} />,
            items: ['React', 'Ant Design', 'TypeScript', 'React Router'],
            color: 'green'
        },
        {
            title: '部署与运维',
            icon: <CloudServerOutlined style={{ color: '#eb2f96' }} />,
            items: ['Docker', 'CI/CD'],
            color: 'magenta'
        }
    ];

    const milestones = [
        {
            title: '初始版本发布',
            description: '支持对话，支持自定义模型，支持多渠道接入，支持用户管理',
            time: '2025 Q1',
            color: 'green'
        }
    ];

    return (
        <Layout style={{ background: '#fff' }}>
            <Flexbox align="flex-start" padding={24}>
                <Button 
                    type="link" 
                    icon={<HomeOutlined />} 
                    onClick={() => navigate('/')}
                    style={{ fontSize: '18px', padding: 0 }}
                >
                    返回首页
                </Button>
            </Flexbox>
            <Content>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                    {/* 头部介绍 */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 64,
                        background: 'linear-gradient(135deg, #1890ff11 0%, #eb2f9611 100%)',
                        padding: '48px 24px',
                        borderRadius: '16px'
                    }}>
                        <Title level={1} style={{ marginBottom: 24 }}>
                            <ThunderboltOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                            Owl AI Chat
                        </Title>
                        <Paragraph style={{
                            fontSize: 20,
                            color: '#666',
                            maxWidth: 800,
                            margin: '0 auto 24px'
                        }}>
                            企业级AI对话系统解决方案，为您的业务提供智能对话支持
                        </Paragraph>
                        <Space size="middle">
                            <Button type="primary" icon={<GithubOutlined />} size="large" onClick={() => window.open(GITHUB_URL, '_blank')}>
                                GitHub
                            </Button>
                            <Button icon={<ReadOutlined />} size="large">
                                开发文档
                            </Button>
                        </Space>
                    </div>

                    <div style={{ marginBottom: 64 }}>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
                            核心特性
                        </Title>
                        <Row gutter={[24, 24]}>
                            {features.map((feature, index) => (
                                <Col xs={24} sm={12} md={6} key={index}>
                                    <Card
                                        hoverable
                                        style={{ height: '100%' }}
                                        bodyStyle={{
                                            textAlign: 'center',
                                            background: feature.color,
                                            borderRadius: '8px',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            padding: '32px 24px'
                                        }}
                                    >
                                        <div style={{ marginBottom: 24 }}>{feature.icon}</div>
                                        <Title level={4} style={{ marginBottom: 16 }}>{feature.title}</Title>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>{feature.description}</Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* 技术栈 */}
                    <div style={{ marginBottom: 64 }}>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
                            技术栈
                        </Title>
                        <Row gutter={[24, 24]}>
                            {techStack.map((stack, index) => (
                                <Col xs={24} sm={8} key={index}>
                                    <Card
                                        title={
                                            <Space>
                                                {stack.icon}
                                                {stack.title}
                                            </Space>
                                        }
                                        style={{ height: '100%' }}
                                        headStyle={{ borderBottom: `2px solid ${stack.color === 'blue' ? '#1890ff' : stack.color === 'green' ? '#52c41a' : '#eb2f96'}` }}
                                    >
                                        <div style={{ minHeight: '120px' }}>
                                            {stack.items.map((item, i) => (
                                                <Tag
                                                    key={i}
                                                    style={{ margin: '4px', fontSize: '14px', padding: '4px 12px' }}
                                                    color={stack.color}
                                                >
                                                    {item}
                                                </Tag>
                                            ))}
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* 发展历程 */}
                    <div style={{ marginBottom: 64 }}>
                        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
                            发展历程
                        </Title>
                        <Card bordered={false} style={{
                            background: '#fafafa',
                            padding: '32px',
                            borderRadius: '16px'
                        }}>
                            <Timeline mode="alternate">
                                {milestones.map((milestone, index) => (
                                    <Timeline.Item
                                        key={index}
                                        color={milestone.color}
                                        dot={milestone.color === 'red' ? <RocketOutlined style={{ fontSize: '16px' }} /> : null}
                                    >
                                        <Card
                                            size="small"
                                            title={milestone.title}
                                            extra={<Tag color={milestone.color}>{milestone.time}</Tag>}
                                            style={{ width: 300, borderRadius: '8px' }}
                                        >
                                            <Text type="secondary">{milestone.description}</Text>
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Card>
                    </div>

                    <Divider style={{ margin: '48px 0' }} />
                    <div style={{ textAlign: 'center', color: '#666' }}>
                        <Space direction="vertical" size="large">
                            <Space size="large">
                                <Button type="link" icon={<GithubOutlined />} onClick={() => window.open(GITHUB_URL, '_blank')}>
                                    GitHub
                                </Button>
                                <Button type="link" icon={<ReadOutlined />}>
                                    文档
                                </Button>
                                <Button type="link" icon={<TeamOutlined />}>
                                    社区
                                </Button>
                            </Space>
                            <Paragraph type="secondary">
                                欢迎加入我们的开源社区，共同建设更好的AI对话平台
                            </Paragraph>
                            <Flexbox gap={8}>
                                <Text type="secondary">
                                    Copyright © {new Date().getFullYear()}  Coffee. All rights reserved.
                                </Text>
                                <Divider type="vertical" />
                                <Text type="secondary">
                                    Powered by .NET 9.0
                                </Text>
                            </Flexbox>
                        </Space>
                    </div>
                </div>
            </Content>
        </Layout>
    );
}