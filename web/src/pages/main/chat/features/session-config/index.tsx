import React, { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useChatStore } from '@/store/chat';
import { Button, Input, Select, Slider, Form, Checkbox, Tooltip, Drawer, Space, Typography, Card } from 'antd';
import { chatSelectors } from '@/store/chat/selectors';
import { theme } from 'antd';
import { getIconByName } from '@/utils/iconutil';
import { InfoCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import ModelFeatureTags from '@/features/ModelFeatureTags';

const { Title } = Typography;

// 自定义的配置面板组件
const ConfigPanel = ({ 
  title, 
  children, 
  defaultExpanded = true 
}: { 
  title: React.ReactNode, 
  children: React.ReactNode, 
  defaultExpanded?: boolean 
}) => {
  const { token } = theme.useToken();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{ marginBottom: 16 }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: expanded ? `1px solid ${token.colorBorderSecondary}` : 'none',
          marginBottom: expanded ? 16 : 0,
        }}
      >
        {expanded ? 
          <DownOutlined style={{ marginRight: 8, color: token.colorPrimary }} /> : 
          <RightOutlined style={{ marginRight: 8, color: token.colorTextSecondary }} />
        }
        {title}
      </div>
      {expanded && (
        <div style={{ padding: '0 8px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const ModelSelector = ({ renameModel, models, setRenameModel }: { 
    renameModel: string | undefined, 
    models: any[], 
    setRenameModel: (value: string) => void 
}) => {
    
    // 过滤掉不存在的modelIds
    const validModelId = renameModel ? 
        models?.some(model => model.models?.some((chatModel: any) => chatModel.id === renameModel)) ? 
        renameModel : undefined : undefined;

    return (
        <Select
            value={validModelId}
            onChange={(value) => setRenameModel(value)}
            style={{ width: '100%' }}
            placeholder="选择模型"
            dropdownStyle={{
                maxHeight: 450,
                overflow: "auto",
            }}
        >
            {models?.map((model) => (
                <Select.OptGroup
                    key={model.provider}
                    label={model.provider}
                >
                    {model.models?.map((chatModel: any) => (
                        <Select.Option
                            key={chatModel.id}
                            value={chatModel.id}
                        >
                            <Flexbox
                                horizontal
                                style={{ alignItems: "center" }}
                            >
                                {getIconByName(model.provider, 22)}
                                <span
                                    style={{
                                        marginLeft: 8,
                                        flex: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {chatModel.displayName}
                                </span>
                                {chatModel.contextWindowTokens && (
                                    <Tooltip title="最大上下文窗口大小">
                                        <ModelFeatureTags
                                                tokens={chatModel.contextWindowTokens}
                                                vision={chatModel.abilities?.vision}
                                                functionCall={chatModel.abilities?.functionCall}
                                            />
                                    </Tooltip>
                                )}
                            </Flexbox>
                        </Select.Option>
                    ))}
                </Select.OptGroup>
            ))}
        </Select>
    );
}

const SliderWithTooltip = ({ label, name, min, max, step, marks, tooltip }: any) => (
    <Form.Item
        label={
            <Tooltip title={tooltip}>
                <Space>
                    {label}
                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
                </Space>
            </Tooltip>
        }
        name={name}
    >
        <Slider
            min={min}
            max={max}
            step={step}
            marks={marks}
            tooltip={{ formatter: (value) => `${value}` }}
        />
    </Form.Item>
);

export default function SessionConfig() {
    const { token } = theme.useToken();
    const [
        sessionConfigExpanded,
        setExpanded,
        model,
        currentSession,
        updateSession,
        models
    ] = useChatStore(state => [
        state.sessionConfigExpanded,
        state.setSessionConfigExpanded,
        chatSelectors.getCurrentModel(state),
        state.currentSession,
        state.updateSession,
        state.models]);

    const [form] = Form.useForm();
    const [renameModel, setRenameModel] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (currentSession) {
            form.setFieldsValue(currentSession);
            setRenameModel(currentSession.renameModel);
        }
    }, [currentSession, form]);

    const onSubmitted = async (values: any) => {
        values.id = currentSession.id;
        values.renameModel = renameModel;
        await updateSession(values);
        setExpanded(false);
    };

    return (
        <Drawer
            title={<Title level={4} style={{ margin: 0 }}>会话配置</Title>}
            placement="right"
            onClose={() => setExpanded(false)}
            open={sessionConfigExpanded}
            width={420}
            styles={{
                header: {
                    padding: '16px 24px',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                },
                body: {
                    padding: '24px',
                    paddingBottom: 100,
                },
                footer: {
                    padding: '16px 24px',
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                }
            }}
            footer={
                <Space>
                    <Button
                        size='large'
                        onClick={() => form.resetFields()}
                        style={{
                            height: 48,
                            fontSize: 16,
                            borderRadius: token.borderRadius,
                        }}>
                        重置
                    </Button>
                    <Button
                        size='large'
                        onClick={() => form.submit()}
                        type="primary"
                        style={{
                            height: 48,
                            fontSize: 16,
                            borderRadius: token.borderRadius,
                            flex: 1,
                        }}>
                        保存设置
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                size="middle"
                onFinish={onSubmitted}
                initialValues={currentSession}
                style={{ width: '100%' }}
            >
                <ConfigPanel title={<Title level={5} style={{ margin: 0 }}>基本信息</Title>} defaultExpanded={true}>
                    <Card bordered={false} style={{ background: token.colorBgElevated }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Form.Item label="会话描述" name="description">
                                <Input.TextArea
                                    placeholder="请输入会话描述"
                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                    style={{ borderRadius: token.borderRadius }}
                                />
                            </Form.Item>
                            <Form.Item label='会话系统提示词' name='system'>
                                <Input.TextArea
                                    style={{
                                        height: 100,
                                        borderRadius: token.borderRadius
                                    }}
                                    placeholder="请输入会话系统提示词" />
                            </Form.Item>
                        </Space>
                    </Card>
                </ConfigPanel>

                <ConfigPanel title={<Title level={5} style={{ margin: 0 }}>标签与分类</Title>} defaultExpanded={true}>
                    <Card bordered={false} style={{ background: token.colorBgElevated }}>
                        <Form.Item label="会话标签" name="tags">
                            <Select
                                mode="tags"
                                placeholder="请输入标签"
                                style={{ width: '100%' }}
                                options={[
                                    { label: '对话', value: '对话' },
                                    { label: '编程', value: '编程' },
                                    { label: 'AI', value: 'AI' },
                                    { label: '机器学习', value: '机器学习' },
                                    { label: '自然语言处理', value: '自然语言处理' },
                                    { label: '聊天', value: '聊天' },
                                    { label: '聊天机器人', value: '聊天机器人' }
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            label="收藏" name="favorite"
                            valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                    </Card>
                </ConfigPanel>

                <ConfigPanel title={<Title level={5} style={{ margin: 0 }}>模型设置</Title>} defaultExpanded={true}>
                    <Card bordered={false} style={{ background: token.colorBgElevated }}>
                        <Form.Item label="话题重命名模型" name="renameModel">
                            <ModelSelector
                                renameModel={renameModel}
                                setRenameModel={setRenameModel}
                                models={models}
                            />
                        </Form.Item>
                    </Card>
                </ConfigPanel>

                <ConfigPanel title={<Title level={5} style={{ margin: 0 }}>生成参数</Title>} defaultExpanded={true}>
                    <Card bordered={false} style={{ background: token.colorBgElevated }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <SliderWithTooltip
                                label="温度参数"
                                name="temperature"
                                min={0.1}
                                max={1}
                                step={0.1}
                                marks={{
                                    0.1: '保守',
                                    0.5: '平衡',
                                    1: '创造性',
                                }}
                                tooltip="控制生成文本的随机性和创造性"
                            />

                            <SliderWithTooltip
                                label="最大令牌数"
                                name="maxTokens"
                                min={1}
                                max={model?.contextWindowTokens ?? 4096}
                                tooltip="设置生成文本的最大长度"
                            />

                            <SliderWithTooltip
                                label="Top P"
                                name="topP"
                                min={0.1}
                                max={1}
                                step={0.1}
                                tooltip="控制生成文本的多样性"
                            />

                            <SliderWithTooltip
                                label="频率惩罚"
                                name="frequencyPenalty"
                                min={-2.0}
                                max={2}
                                step={0.1}
                                marks={{
                                    0: '无惩罚',
                                    1: '中等',
                                    2: '最高',
                                }}
                                tooltip="减少重复词语的使用"
                            />

                            <SliderWithTooltip
                                label="存在惩罚"
                                name="presencePenalty"
                                min={0}
                                max={2}
                                step={0.1}
                                marks={{
                                    0: '无惩罚',
                                    1: '中等',
                                    2: '最高',
                                }}
                                tooltip="鼓励使用新的词语和概念"
                            />

                            <SliderWithTooltip
                                label="历史消息数量"
                                name="historyMessagesCount"
                                min={0}
                                max={50}
                                step={1}
                                marks={{ 0: '无限制' }}
                                tooltip="设置保留的历史消息数量"
                            />
                        </Space>
                    </Card>
                </ConfigPanel>
            </Form>
        </Drawer>
    );
}