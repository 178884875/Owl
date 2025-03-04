import { Flexbox } from 'react-layout-kit';
import { useChatStore } from '@/store/chat';
import { Button, Input, Select, Slider, Form, Checkbox, Dropdown, Tooltip, Drawer, Divider, Space, Typography } from 'antd';
import { chatSelectors } from '@/store/chat/selectors';
import { theme } from 'antd';
import { getIconByName } from '@/utils/iconutil';
import ModelFeatureTags from '@/features/ModelFeatureTags';
import { MenuItemGroupType } from 'antd/es/menu/interface';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

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
            form.setFieldsValue({
                description: currentSession.description,
                tags: currentSession.tags,
                temperature: currentSession.temperature,
                maxTokens: currentSession.maxTokens,
                topP: currentSession.topP,
                frequencyPenalty: currentSession.frequencyPenalty,
                presencePenalty: currentSession.presencePenalty,
                historyMessagesCount: currentSession.historyMessagesCount,
                favorite: currentSession.favorite,
                modelId: currentSession.modelId,
            });
            setRenameModel(currentSession.renameModel);
        }
    }, [currentSession]);

    const onSubmitted = async (values: any) => {
        values.id = currentSession.id;
        values.renameModel = renameModel;
        await updateSession(values);
        setExpanded(false);
    }

    const renderModel = () => {
        const item = models?.find(item => item.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === renameModel) !== undefined)?.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === renameModel);
        return <Flexbox
            horizontal
            align="center"
            gap={8}
            style={{
                fontSize: 16,
                padding: '8px 12px',
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                boxShadow: token.boxShadowTertiary,
                width: '100%',
            }}
        >
            {getIconByName(item?.provider, 26)}
            <Text strong>{item?.displayName || '选择模型'}</Text>
        </Flexbox>;
    }

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
                <Button
                    size='large'
                    onClick={() => form.submit()}
                    type="primary" 
                    block
                    style={{
                        height: 48,
                        fontSize: 16,
                        borderRadius: token.borderRadius,
                    }}>
                    保存设置
                </Button>
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
                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <div>
                        <Title level={5} style={{ marginBottom: 16 }}>基本信息</Title>
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
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 16 }}>标签与分类</Title>
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
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 16 }}>模型设置</Title>
                        <Form.Item label="话题重命名模型" name="renameModel">
                            <Dropdown
                                trigger={['click']}
                                menu={{
                                    style: {
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    },
                                    items: models?.map((item) => ({
                                        label: item.provider,
                                        type: 'group',
                                        children: item.models?.map((chatModel: any) => ({
                                            label:
                                                <Flexbox
                                                    horizontal
                                                    style={{
                                                        fontSize: 16,
                                                    }}
                                                > <Tooltip
                                                    placement="right"
                                                    title={chatModel.description}>
                                                        <div style={{
                                                            flex: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            marginLeft: 5,
                                                        }}>
                                                            {chatModel.displayName}
                                                        </div>
                                                    </Tooltip>
                                                    <ModelFeatureTags
                                                        tokens={chatModel.contextWindowTokens}
                                                        vision={chatModel.vision}
                                                        functionCall={chatModel.functionCall}
                                                    />
                                                </Flexbox>,
                                            value: chatModel.id,
                                            key: chatModel.id,
                                            style: {
                                                backgroundColor: chatModel.id === model ? token.controlItemBgActiveHover : 'transparent',
                                            },
                                            onClick: () => {
                                                setRenameModel(chatModel.id);
                                            },
                                            icon: getIconByName(item.provider, 22),
                                        })),
                                    })) as MenuItemGroupType[] || [],
                                }}
                            >
                                <div style={{
                                    cursor: 'pointer',
                                    width: '100%',
                                }}>
                                    {renderModel()}
                                </div>
                            </Dropdown>
                        </Form.Item>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 16 }}>生成参数</Title>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Form.Item label="温度参数" name="temperature">
                                <Slider
                                    min={0.1}
                                    max={1}
                                    step={0.1}
                                    marks={{
                                        0.1: '保守',
                                        0.5: '平衡',
                                        1: '创造性',
                                    }}
                                    tooltip={{ formatter: (value) => `${value}` }}
                                />
                            </Form.Item>

                            <Form.Item label="最大令牌数" name="maxTokens">
                                <Slider
                                    min={1}
                                    max={model?.contextWindowTokens ?? 4096}
                                    style={{ width: '100%' }}
                                    tooltip={{ formatter: (value) => `${value}` }}
                                />
                            </Form.Item>

                            <Form.Item label="Top P" name="topP">
                                <Slider
                                    min={0.1}
                                    max={1}
                                    step={0.1}
                                    tooltip={{ formatter: (value) => `${value}` }}
                                />
                            </Form.Item>

                            <Form.Item label="频率惩罚" name="frequencyPenalty">
                                <Slider
                                    min={-2.0}
                                    max={2}
                                    step={0.1}
                                    marks={{
                                        0: '无惩罚',
                                        1: '中等',
                                        2: '最高',
                                    }}
                                    tooltip={{ formatter: (value) => `${value}` }}
                                />
                            </Form.Item>

                            <Form.Item label="存在惩罚" name="presencePenalty">
                                <Slider
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    marks={{
                                        0: '无惩罚',
                                        1: '中等',
                                        2: '最高',
                                    }}
                                    tooltip={{ formatter: (value) => `${value}` }}
                                />
                            </Form.Item>

                            <Form.Item label="历史消息数量" name="historyMessagesCount">
                                <Slider
                                    min={0}
                                    max={50}
                                    step={1}
                                    marks={{ 0: '无限制' }}
                                    tooltip={{ formatter: (value) => value === 0 ? '无限制' : `${value}` }}
                                />
                            </Form.Item>
                        </Space>
                    </div>
                </Space>
            </Form>
        </Drawer>
    );
}