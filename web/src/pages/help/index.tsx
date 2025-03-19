import { Layout, Typography, Card, Collapse, Space, Divider, Tag } from 'antd';
import { ThunderboltOutlined, ApiOutlined, SafetyCertificateOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;

export default function Help() {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <div style={{
            width:'100%',
            margin:'0 auto'
        }}>
          <Space direction="vertical" size="large" className="w-full">
            {/* 头部介绍 */}
            <Card className="w-full">
              <Space align="center">
                <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={2} style={{ margin: 0 }}>Owl - 企业级 AI 对话系统</Title>
              </Space>
              <Paragraph className="mt-4">
                基于 .NET 构建的企业级 AI 对话系统，提供灵活的渠道集成能力和丰富的功能特性。
              </Paragraph>
            </Card>

            <Card 
              className="w-full"
              title={
                <Space>
                  <RocketOutlined />
                  <span>核心特性</span>
                </Space>
              }
            >
              <Space direction="vertical" className="w-full">
                <Card type="inner" title="技术架构" className="w-full">
                  <ul className="list-disc pl-6">
                    <li>后端：基于 .NET 框架开发，确保高性能和可扩展性</li>
                    <li>前端：使用 React + Ant Design，提供现代化的用户界面</li>
                    <li>微服务架构：支持分布式部署和横向扩展</li>
                  </ul>
                </Card>
                
                <Card type="inner" title="企业级特性" className="w-full">
                  <ul className="list-disc pl-6">
                    <li>多租户支持：独立的数据隔离和配置管理</li>
                    <li>权限管理：细粒度的角色权限控制</li>
                    <li>审计日志：全面的操作追踪和数据统计</li>
                  </ul>
                </Card>
              </Space>
            </Card>

            {/* 渠道支持 */}
            <Card 
              className="w-full"
              title={
                <Space>
                  <ApiOutlined />
                  <span>AI 渠道支持</span>
                </Space>
              }
            >
              <Collapse defaultActiveKey={['1']} className="w-full">
                <Panel header="支持的 AI 渠道" key="1">
                  <Space wrap>
                    <Tag color="blue">OpenAI</Tag>
                    <Tag color="cyan">Azure OpenAI</Tag>
                    <Tag color="green">Anthropic Claude</Tag>
                    <Tag color="purple">文心一言</Tag>
                    <Tag color="magenta">讯飞星火</Tag>
                    <Tag color="orange">自定义渠道</Tag>
                  </Space>
                  <Divider />
                  <Paragraph>
                    通过插件化架构，支持快速接入新的 AI 服务提供商。企业可以根据自身需求选择合适的 AI 模型或自行开发集成新的渠道。
                  </Paragraph>
                </Panel>
                
                <Panel header="渠道配置指南" key="2">
                  <ol className="list-decimal pl-6">
                    <li>在管理后台添加新的渠道配置</li>
                    <li>填写渠道相关的认证信息（API Key、Endpoint 等）</li>
                    <li>配置渠道参数（温度、最大 Token 等）</li>
                    <li>设置渠道的调用优先级和负载均衡策略</li>
                  </ol>
                </Panel>
              </Collapse>
            </Card>

            {/* 安全与合规 */}
            <Card 
              className="w-full"
              title={
                <Space>
                  <SafetyCertificateOutlined />
                  <span>安全与合规</span>
                </Space>
              }
            >
              <Space direction="vertical" className="w-full">
                <Card type="inner" title="数据安全" className="w-full">
                  <ul className="list-disc pl-6">
                    <li>全程 SSL 加密通信</li>
                    <li>敏感数据加密存储</li>
                    <li>支持私有化部署</li>
                  </ul>
                </Card>
                
                <Card type="inner" title="访问控制" className="w-full">
                  <ul className="list-disc pl-6">
                    <li>基于 JWT 的身份认证</li>
                    <li>细粒度的 RBAC 权限控制</li>
                    <li>操作审计和追踪</li>
                  </ul>
                </Card>
              </Space>
            </Card>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}