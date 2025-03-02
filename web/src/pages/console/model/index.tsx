import { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Card, Table, Button, Input, Modal, Form, InputNumber, Switch, Select, Menu, Typography, Space, Popconfirm, message, Tabs, Checkbox, Radio, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { getModelList, enableModel, createModel, updateModel } from '@/apis/Model';
import { getIconByName } from '@/utils/iconutil';

export default function Model() {
    // 初始数据状态
    const [modelData, setModelData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [chatModelData, setChatModelData] = useState<any[]>([]);
    // 选中提供商状态
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    // 搜索文本状态
    const [searchText, setSearchText] = useState('');
    // 添加模型弹窗状态
    const [isModalVisible, setIsModalVisible] = useState(false);
    // 添加编辑模式状态
    const [isEditMode, setIsEditMode] = useState(false);
    // 当前编辑的模型
    const [currentModel, setCurrentModel] = useState<any>(null);
    // 表单引用
    const [form] = Form.useForm();
    // 可用提供商列表
    const [availableProviders, setAvailableProviders] = useState(['OpenAI', 'DeepSeek', 'Google', 'Anthropic', "SiliconCloud", 'Moonshot', 'GiteeAI', 'Github', 'Qwen', 'Grok']);

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

    // 获取选中提供商的模型
    const getModelsForProvider = (modelData: any) => {
        const provider = modelData.find((p: any) => p.provider === selectedProvider);
        if (!provider) {
            // 默认显示第一个
            if (modelData.length > 0) {
                setSelectedProvider(modelData[0].provider);
            }
            return;
        }

        if (searchText) {
            const models = provider.models.filter((model: any) =>
                model.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
                model.description.toLowerCase().includes(searchText.toLowerCase()) ||
                model.id.toLowerCase().includes(searchText.toLowerCase())
            );
            setChatModelData(models);
        } else {
            setChatModelData(provider.models);
        }
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
        setIsEditMode(false);
        setCurrentModel(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 显示编辑模型弹窗
    const showEditModal = (model: any) => {
        setIsEditMode(true);
        setCurrentModel(model);

        // 设置当前选中的提供商
        setSelectedProvider(model.provider);

        // 预填充表单数据
        form.setFieldsValue({
            provider: model.provider,
            id: model.modelId,
            displayName: model.displayName,
            description: model.description,
            contextWindowTokens: model.contextWindowTokens,
            enabled: model.enabled,
            type: model.type,
            maxOutput: model.maxOutput,
            input: model.pricing?.input,
            output: model.pricing?.output,
            cachedInput: model.pricing?.cachedInput,
            writeCacheInput: model.pricing?.writeCacheInput,
            audioInput: model.pricing?.audioInput,
            audioOutput: model.pricing?.audioOutput,
            cachedAudioInput: model.pricing?.cachedAudioInput,
            currency: model.pricing?.currency || 'USD',
            hd: model.pricing?.hd,
            standard: model.pricing?.standard,
            functionCall: model.abilities?.functionCall,
            reasoning: model.abilities?.reasoning,
            vision: model.abilities?.vision,
            releasedAt: model.releasedAt,
            resolutions: model.resolutions
        });

        setIsModalVisible(true);
    };

    // 处理弹窗确认
    const handleModalOk = async () => {
        const values = await form.validateFields();
        // 创建模型数据对象
        const data = {
            provider: values.provider,
            modelId: values.id,
            displayName: values.displayName,
            description: values.description,
            contextWindowTokens: values.contextWindowTokens,
            enabled: values.enabled,
            type: values.type,
            maxOutput: values.maxOutput,
            pricing: {
                input: values.input,
                output: values.output,
                cachedInput: values.cachedInput,
                writeCacheInput: values.writeCacheInput || 0,
                audioInput: values.audioInput || 0,
                audioOutput: values.audioOutput || 0,
                cachedAudioInput: values.cachedAudioInput || 0,
                currency: values.currency || 'USD',
                hd: values.hd || 0,
                standard: values.standard || 0
            },
            releasedAt: values.releasedAt,
            abilities: {
                functionCall: values.functionCall || false,
                reasoning: values.reasoning || false,
                vision: values.vision || false
            },
            resolutions: values.resolutions || []
        };

        try {
            let res;
            if (isEditMode && currentModel) {
                // 编辑模式：添加ID并调用更新API
                // 修复：使用正确的ID字段名称
                const updateData = {
                    ...data,
                    id: currentModel.id  // 保留原始ID
                };
                res = await updateModel(updateData);
                if (res.success) {
                    message.success('模型更新成功');
                } else {
                    message.error(`模型更新失败: ${res.message || '未知错误'}`);
                }
            } else {
                // 创建模式
                res = await createModel(data);
                if (res.success) {
                    message.success('模型创建成功');
                } else {
                    message.error(`模型创建失败: ${res.message || '未知错误'}`);
                }
            }

            if (res.success) {
                loadModelList();
                form.resetFields();
                setIsModalVisible(false);
            } else {
                message.error(`请求发生错误: ${res.message || '未知错误'}`);
            }
        } catch (error) {
            message.error(`请求发生错误: ${error}`);
        }
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
                    <Button type="text" onClick={() => showEditModal(record)}>
                        编辑
                    </Button>
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
                    gap={32}
                    style={{
                        height: 'calc(100vh - 200px)'
                    }}
                >
                    <Card title="提供商" style={{
                        width: 250,
                        maxWidth: 250,
                    }}>
                        <Menu
                            selectedKeys={selectedProvider ? [selectedProvider] : []}
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
                            loading={loading}
                            columns={columns}
                            dataSource={chatModelData}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Flexbox>
            </Card>

            <Modal
                title={isEditMode ? `编辑模型: ${currentModel?.displayName}` : "添加模型"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    size="middle"
                >
                    <Tabs defaultActiveKey="basic">
                        <Tabs.TabPane tab="基本信息" key="basic">
                            <Flexbox gap={16}>
                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="provider"
                                        label="提供商"
                                        style={{ flex: 1 }}
                                    >
                                        <Select
                                            placeholder="选择提供商"
                                            disabled={isEditMode}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    {!isEditMode && (
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
                                                    )}
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
                                </Flexbox>

                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="displayName"
                                        label="模型名称"
                                        rules={[{ required: true, message: '请输入模型名称' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input placeholder="例如: GPT-4, Claude-3.5-Sonnet" />
                                    </Form.Item>

                                    <Form.Item
                                        name="id"
                                        label="模型ID"
                                        rules={[{ required: true, message: '请输入模型ID' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input placeholder="例如: gpt-4, claude-3.5-sonnet" />
                                    </Form.Item>
                                </Flexbox>

                                <Form.Item
                                    name="description"
                                    label="模型描述"
                                    rules={[{ required: true, message: '请输入模型描述' }]}
                                >
                                    <Input.TextArea rows={3} placeholder="请输入模型的详细描述..." />
                                </Form.Item>

                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="contextWindowTokens"
                                        label="上下文窗口大小"
                                        rules={[{ required: true, message: '请输入上下文窗口大小' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber
                                            defaultValue={128000}
                                            min={4096}
                                            step={4096}
                                            max={128000}
                                            addonAfter="tokens"
                                            style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="maxOutput"
                                        label="最大输出"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber
                                            min={4096}
                                            step={4096}
                                            defaultValue={4096}
                                            max={65536}
                                            addonAfter="tokens"
                                            style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="releasedAt"
                                        label="发布日期"
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
                                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                                </Form.Item>
                            </Flexbox>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="定价信息" key="pricing">
                            <Flexbox gap={16}>
                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="input"
                                        label="输入价格"
                                        rules={[{ required: true, message: '请输入输入价格' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 3" addonAfter="$/百万tokens" />
                                    </Form.Item>

                                    <Form.Item
                                        name="output"
                                        label="输出价格"
                                        rules={[{ required: true, message: '请输入输出价格' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 12" addonAfter="$/百万tokens" />
                                    </Form.Item>
                                </Flexbox>

                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="cachedInput"
                                        label="缓存输入价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 0.1" addonAfter="$/百万tokens" />
                                    </Form.Item>

                                    <Form.Item
                                        name="writeCacheInput"
                                        label="写入缓存价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 0.1" addonAfter="$/百万tokens" />
                                    </Form.Item>
                                </Flexbox>

                                <Form.Item
                                    name="currency"
                                    label="币种"
                                    initialValue="USD"
                                >
                                    <Radio.Group buttonStyle="solid">
                                        <Radio.Button value="USD">美元 (USD)</Radio.Button>
                                        <Radio.Button value="CNY">人民币 (CNY)</Radio.Button>
                                        <Radio.Button value="EUR">欧元 (EUR)</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Divider orientation="left">音频定价</Divider>

                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="audioInput"
                                        label="音频输入价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 1.5" addonAfter="$/分钟" />
                                    </Form.Item>

                                    <Form.Item
                                        name="audioOutput"
                                        label="音频输出价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 2.0" addonAfter="$/分钟" />
                                    </Form.Item>
                                </Flexbox>

                                <Flexbox horizontal gap={16}>
                                    <Form.Item
                                        name="cachedAudioInput"
                                        label="缓存音频输入价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 0.5" addonAfter="$/分钟" />
                                    </Form.Item>

                                    <Form.Item
                                        name="hd"
                                        label="HD 价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 5.0" addonAfter="$/分钟" />
                                    </Form.Item>

                                    <Form.Item
                                        name="standard"
                                        label="标准价格"
                                        style={{ flex: 1 }}
                                    >
                                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="例如: 3.0" addonAfter="$/分钟" />
                                    </Form.Item>
                                </Flexbox>
                            </Flexbox>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="模型能力" key="abilities">
                            <Flexbox gap={16}>
                                <Card size="small" title="核心能力">
                                    <Flexbox horizontal gap={24}>
                                        <Form.Item
                                            name="functionCall"
                                            valuePropName="checked"
                                            initialValue={false}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Checkbox>函数调用能力</Checkbox>
                                        </Form.Item>

                                        <Form.Item
                                            name="reasoning"
                                            valuePropName="checked"
                                            initialValue={false}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Checkbox>推理能力</Checkbox>
                                        </Form.Item>

                                        <Form.Item
                                            name="vision"
                                            valuePropName="checked"
                                            initialValue={false}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Checkbox>视觉能力</Checkbox>
                                        </Form.Item>
                                    </Flexbox>
                                </Card>

                                <Form.Item
                                    name="resolutions"
                                    label="支持的分辨率"
                                >
                                    <Select mode="tags" placeholder="输入支持的图像分辨率">
                                        <Select.Option value="512x512">512x512</Select.Option>
                                        <Select.Option value="1024x1024">1024x1024</Select.Option>
                                        <Select.Option value="2048x2048">2048x2048</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Flexbox>
                        </Tabs.TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </Flexbox>
    );
}