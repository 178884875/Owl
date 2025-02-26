import React, { useState, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Card, Table, Button, Input, Modal, Form, InputNumber, Switch, Select, Menu, Typography, Space, Popconfirm, Avatar, message } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { getModelList, enableModel } from '@/apis/Model';
import { getIconByName } from '@/utils/iconutil';

export default function Model() {
    // 初始数据状态
    const [modelData, setModelData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [chatModelData, setChatModelData] = useState<any[]>([]);

    const loadModelList = async () => {
        setLoading(true);
        const res = await getModelList();
        setModelData(res.data);
        getModelsForProvider(res.data);
        setLoading(false);
    }

    useEffect(() => {
        loadModelList();
    }, []);
    // 选中提供商状态
    const [selectedProvider, setSelectedProvider] = useState('OpenAI');
    // 搜索文本状态
    const [searchText, setSearchText] = useState('');
    // 添加模型弹窗状态
    const [isModalVisible, setIsModalVisible] = useState(false);
    // 表单引用
    const [form] = Form.useForm();
    // 可用提供商列表
    const [availableProviders, setAvailableProviders] = useState(['OpenAI', 'DeepSeek']);

    // 获取选中提供商的模型
    const getModelsForProvider = (modelData: any) => {
        const provider = modelData.find((p: any) => p.provider === selectedProvider);
        if (!provider) return [];

        // 根据搜索文本过滤模型
        if (searchText) {
            return provider.models.filter((model: any) =>
                model.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
                model.description.toLowerCase().includes(searchText.toLowerCase()) ||
                model.id.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setChatModelData(provider.models);
    };

    useEffect(() => {
        getModelsForProvider(modelData);
    }, [searchText, selectedProvider]);


    // 处理提供商选择
    const handleProviderSelect = (key: string) => {
        setSelectedProvider(key);
    };

    // 显示添加模型弹窗
    const showAddModal = () => {
        setIsModalVisible(true);
    };

    // 处理弹窗确认
    const handleModalOk = () => {
        form.validateFields().then(values => {
            // 创建新模型对象
            const newModel = {
                id: values.id,
                displayName: values.displayName,
                description: values.description,
                contextWindowTokens: values.contextWindowTokens,
                enabled: values.enabled,
                type: values.type,
                pricing: {
                    input: values.input,
                    output: values.output,
                    cachedInput: values.cachedInput,
                },
                releasedAt: values.releasedAt,
                functionCall: values.functionCall,
                maxOutput: values.maxOutput,

            };

            // 添加函数调用能力（如果启用）
            if (values.functionCall) {
                newModel.functionCall = true;
            }

            // 添加缓存输入价格（如果提供）
            if (values.cachedInput) {
                newModel.pricing.cachedInput = values.cachedInput;
            }

            // 添加最大输出（如果提供）
            if (values.maxOutput) {
                newModel.maxOutput = values.maxOutput;
            }

            // 更新模型数据
            setModelData(prevData => {
                const newData = [...prevData];
                const providerIndex = newData.findIndex(p => p.provider === values.provider);

                if (providerIndex !== -1) {
                    // 提供商存在，添加模型到现有提供商
                    newData[providerIndex].chatModels.push(newModel);
                } else {
                    // 提供商不存在，创建新提供商并添加模型
                    newData.push({
                        provider: values.provider,
                        chatModels: [newModel]
                    });
                    // 更新可用提供商列表
                    setAvailableProviders(prev => [...prev, values.provider]);
                }

                return newData;
            });

            // 重置表单并关闭弹窗
            form.resetFields();
            setIsModalVisible(false);
        });
    };

    // 处理弹窗取消
    const handleModalCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
    };

    // 处理删除模型
    const handleDeleteModel = (modelId: string) => {
        setModelData(prevData => {
            const newData = [...prevData];
            const providerIndex = newData.findIndex(p => p.provider === selectedProvider);

            if (providerIndex !== -1) {
                // 从提供商中移除模型
                newData[providerIndex].models = newData[providerIndex].models.filter((model: any) => model.id !== modelId);

                // 如果提供商没有模型，移除提供商
                if (newData[providerIndex].models.length === 0) {
                    const providerToRemove = newData[providerIndex].provider;
                    newData.splice(providerIndex, 1);

                    // 更新可用提供商列表
                    setAvailableProviders(prev => prev.filter(p => p !== providerToRemove));

                    // 如果当前选中的提供商被移除，更新选中提供商
                    if (selectedProvider === providerToRemove && newData.length > 0) {
                        setSelectedProvider(newData[0].provider);
                    }
                }
            }

            return newData;
        });
    };

    const handleEnableModel = (modelId: string) => {
        enableModel(modelId).then((res: any) => {
            if (res.success) {
                message.success('模型状态更新成功');
                // 更新模型状态后刷新整个列表
                loadModelList();
            } else {
                message.error('模型状态更新失败');
            }
        });
    }

    // 定义模型表格列
    const columns = [
        {
            title: '模型ID',
            dataIndex: 'modelId',
            key: 'modelId',
        },
        {
            title: '模型名称',
            dataIndex: 'displayName',
            key: 'displayName',
        },
        {
            title: '上下文窗口大小',
            dataIndex: 'contextWindowTokens',
            key: 'contextWindowTokens',
            render: (tokens: number) => `${tokens.toLocaleString()} tokens`,
        },
        {
            title: '状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => (enabled ? '启用' : '禁用'),
        },
        {
            title: '发布日期',
            dataIndex: 'releasedAt',
            key: 'releasedAt',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <>
                    <Popconfirm
                        title="确定要删除这个模型吗？"
                        onConfirm={() => handleDeleteModel(record.id)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                    <Button type="text" onClick={() => handleEnableModel(record.id)}>
                        {record.enabled ? '禁用' : '启用'}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Flexbox gap={16}>
            <Card
                title="模型管理"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 100px)'
                }}
                extra={
                    <Space>
                        <Input
                            placeholder="搜索模型"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            添加模型
                        </Button>
                    </Space>
                }
            >
                <Flexbox horizontal
                    gap={16}
                    style={{
                        height: 'calc(100vh - 200px)'
                    }}
                >
                    <Card title="提供商" style={{
                        width: 250,
                        maxWidth: 250,
                    }}>
                        <Menu
                            selectedKeys={[selectedProvider]}
                            mode="vertical"
                            style={{
                                overflow: 'auto',
                                height: 'calc(100vh - 290px)'
                            }}
                            onClick={({ key }) => handleProviderSelect(key)}
                        >
                            {modelData.map((provider: any) => (
                                <Menu.Item key={provider.provider}>
                                    <Flexbox horizontal
                                        justify="space-between"
                                        align="center"
                                        gap={16}>
                                        {getIconByName(provider.provider)}
                                        <Typography.Text style={{
                                            flex: 1,
                                        }} strong>{provider.provider}</Typography.Text>
                                    </Flexbox>
                                </Menu.Item>
                            ))}
                        </Menu>
                    </Card>
                    <Card
                        title={`${selectedProvider} 模型列表`}
                        style={{
                            flex: 1,
                            height: '100%',
                            overflow: 'auto',
                        }}
                    >
                        <Table
                            columns={columns}
                            dataSource={chatModelData}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Flexbox>
            </Card>

            <Modal
                title="添加模型"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="provider"
                        label="提供商"
                        rules={[{ required: true, message: '请选择提供商' }]}
                    >
                        <Select
                            placeholder="选择提供商"
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                        <Input
                                            style={{ flex: 'auto' }}
                                            placeholder="新提供商名称"
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                            }}
                                        />
                                        <a
                                            style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // 获取输入值
                                                const input = (e.target as HTMLElement).previousSibling as HTMLInputElement;
                                                const value = input.value;
                                                if (value && !availableProviders.includes(value)) {
                                                    setAvailableProviders([...availableProviders, value]);
                                                    form.setFieldsValue({ provider: value });
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            + 添加新提供商
                                        </a>
                                    </div>
                                </>
                            )}
                        >
                            {availableProviders.map(provider => (
                                <Select.Option key={provider} value={provider}>
                                    {provider}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="displayName"
                        label="模型名称"
                        rules={[{ required: true, message: '请输入模型名称' }]}
                    >
                        <Input placeholder="例如: GPT-4, Claude-3.5-Sonnet" />
                    </Form.Item>

                    <Form.Item
                        name="id"
                        label="模型ID"
                        rules={[{ required: true, message: '请输入模型ID' }]}
                    >
                        <Input placeholder="例如: gpt-4, claude-3.5-sonnet" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="模型描述"
                        rules={[{ required: true, message: '请输入模型描述' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入模型的详细描述..." />
                    </Form.Item>

                    <Flexbox horizontal gap={16}>
                        <Form.Item
                            name="contextWindowTokens"
                            label="上下文窗口大小 (tokens)"
                            rules={[{ required: true, message: '请输入上下文窗口大小' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如: 128000" />
                        </Form.Item>

                        <Form.Item
                            name="maxOutput"
                            label="最大输出 (tokens)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如: 65536" />
                        </Form.Item>
                    </Flexbox>

                    <Flexbox horizontal gap={16}>
                        <Form.Item
                            name="type"
                            label="模型类型"
                            rules={[{ required: true, message: '请选择模型类型' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="选择模型类型">
                                <Select.Option value="chat">聊天模型</Select.Option>
                                <Select.Option value="completion">补全模型</Select.Option>
                                <Select.Option value="embedding">嵌入模型</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="releasedAt"
                            label="发布日期"
                            rules={[{ required: true, message: '请输入发布日期' }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="例如: 2024-09-12" />
                        </Form.Item>
                    </Flexbox>

                    <Form.Item
                        name="enabled"
                        label="启用状态"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="functionCall"
                        label="函数调用能力"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>

                    <Typography.Title level={5}>定价信息</Typography.Title>

                    <Flexbox horizontal gap={16}>
                        <Form.Item
                            name="input"
                            label="输入价格 ($/百万 tokens)"
                            rules={[{ required: true, message: '请输入输入价格' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 3" />
                        </Form.Item>

                        <Form.Item
                            name="output"
                            label="输出价格 ($/百万 tokens)"
                            rules={[{ required: true, message: '请输入输出价格' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 12" />
                        </Form.Item>

                        <Form.Item
                            name="cachedInput"
                            label="缓存输入价格 ($/百万 tokens)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 0.1" />
                        </Form.Item>
                    </Flexbox>
                </Form>
            </Modal>
        </Flexbox>
    );
}