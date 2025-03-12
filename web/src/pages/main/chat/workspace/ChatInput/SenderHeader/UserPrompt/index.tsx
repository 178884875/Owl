import React, { useState, useEffect } from 'react';
import { Select, Spin, message, Tooltip, Divider, Button, Modal, Form, Input, List, Typography, Empty, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getUserPrompts, createUserPrompt, deleteUserPrompt } from '@/apis/User';
import { useChatStore } from '@/store/chat/store';
const { Option } = Select;
const { Text, Paragraph } = Typography;

interface Prompt {
    id: number | null;
    name: string;
    description: string;
    prompt: string;
    isDefault: boolean;
}

// 界面模式枚举
enum ModalMode {
    LIST = 'list',
    ADD = 'add',
}

const UserPrompt: React.FC = () => {
    // State for storing all prompts
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedUserPrompt, setSelectedUserPrompt] = useChatStore(state => [state.selectedUserPrompt, state.setSelectedUserPrompt]);
    // Loading state
    const [loading, setLoading] = useState<boolean>(true);
    // 对话框状态
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    // 对话框模式：列表或添加
    const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.LIST);
    // 表单实例
    const [form] = Form.useForm();

    const defaultPrompt: Prompt = {
        id: null,
        name: '正常模式',
        description: '正常模式，正常回答',
        prompt: '',
        isDefault: true
    };

    // Fetch user prompts on component mount
    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            const response = await getUserPrompts();

            // Add the default prompt to the beginning of the list
            const allPrompts = [defaultPrompt, ...response.data];
            setPrompts(allPrompts);

            // Set the default prompt as selected
            setSelectedUserPrompt(null);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch user prompts:', error);
            message.error('加载提示词失败');
            setLoading(false);

            // Even if there's an error, we still want to show the default prompt
            setPrompts([defaultPrompt]);
            setSelectedUserPrompt(null);
        }
    };

    // Handle prompt selection change
    const handlePromptChange = (promptId: number | null) => {
        // Find the selected prompt
        const prompt = prompts.find(p => p.id === promptId) || defaultPrompt;
        setSelectedUserPrompt(prompt?.id);
    };

    // 显示提示词管理对话框
    const showPromptManager = () => {
        setModalMode(ModalMode.LIST);
        setIsModalVisible(true);
    };

    // 切换到添加提示词界面
    const showAddPromptForm = () => {
        form.resetFields();
        setModalMode(ModalMode.ADD);
    };

    // 返回到列表界面
    const backToList = () => {
        setModalMode(ModalMode.LIST);
    };

    // 处理创建提示词
    const handleCreatePrompt = async () => {
        try {
            const values = await form.validateFields();
            
            await createUserPrompt({
                name: values.name,
                description: values.description,
                prompt: values.prompt
            });
            
            message.success('提示词创建成功');
            form.resetFields();
            
            // 重新获取提示词列表
            await fetchPrompts();
            
            // 返回列表界面
            setModalMode(ModalMode.LIST);
        } catch (error) {
            console.error('Failed to create prompt:', error);
            message.error('创建提示词失败');
        }
    };

    // 处理删除提示词
    const handleDeletePrompt = async (id: number) => {
        try {
            await deleteUserPrompt(id);
            message.success('提示词删除成功');
            // 重新获取提示词列表
            fetchPrompts();
        } catch (error) {
            console.error('Failed to delete prompt:', error);
            message.error('删除提示词失败');
        }
    };

    // 渲染提示词列表界面
    const renderPromptList = () => {
        const userPrompts = prompts.filter(p => p.id !== null);
        
        if (userPrompts.length === 0) {
            return (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂无提示词"
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={showAddPromptForm}
                        style={{ marginTop: 16 }}
                    >
                        添加提示词
                    </Button>
                </div>
            );
        }
        
        return (
            <div className="prompt-list-container" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 4px' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={userPrompts}
                    size='small'
                    renderItem={item => (
                        <List.Item
                            key={item.id}
                            actions={[
                                <>
                                    {item.isDefault === false && (
                                        <Popconfirm
                                            title="确定要删除这个提示词吗？"
                                            okText="确定"
                                            cancelText="取消"
                                            onConfirm={() => handleDeletePrompt(item.id!)}
                                        >
                                            <Button 
                                                icon={<DeleteOutlined />} 
                                                type="text" 
                                                danger
                                            />
                                        </Popconfirm>
                                    )}
                                    {
                                        item.isDefault === true && (
                                            <>
                                                <Tag color="blue">
                                                    预设
                                                </Tag>
                                            </>
                                        )
                                    }
                                </>
                            ]}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                background: '#fff',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                            }}
                        >
                            <List.Item.Meta
                                title={
                                    <Text strong style={{ fontSize: '14px' }}>{item.name}</Text>
                                }
                                description={
                                    <>
                                        <Paragraph type="secondary" style={{ fontSize: '10px', margin: '0 0 4px 0' }}>
                                            {item.description}
                                        </Paragraph>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={showAddPromptForm}
                    >
                        添加提示词
                    </Button>
                </div>
            </div>
        );
    };

    // 渲染添加提示词表单界面
    const renderAddPromptForm = () => (
        <>
            <div style={{ marginBottom: 16 }}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    type="link" 
                    onClick={backToList}
                >
                    返回列表
                </Button>
            </div>
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="名称"
                    rules={[{ required: true, message: '请输入提示词名称' }]}
                >
                    <Input placeholder="请输入提示词名称" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="描述"
                    rules={[{ required: true, message: '请输入提示词描述' }]}
                >
                    <Input placeholder="请输入提示词描述" />
                </Form.Item>
                <Form.Item
                    name="prompt"
                    label="提示词内容"
                    rules={[{ required: true, message: '请输入提示词内容' }]}
                >
                    <Input.TextArea 
                        placeholder="请输入提示词内容" 
                        rows={4}
                    />
                </Form.Item>
            </Form>
        </>
    );

    return (
        <>
            {loading ? (
                <Spin tip="加载中..." />
            ) : (
                <>
                    <Select
                        style={{ width: 'auto', marginLeft: '10px', minWidth: '120px' }}
                        bordered={false}
                        size='small'
                        value={selectedUserPrompt ?? null}
                        onChange={handlePromptChange}
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <div style={{ padding: '0 8px 4px', textAlign: 'center' }}>
                                    <Button 
                                        type="text" 
                                        icon={<EditOutlined />} 
                                        onClick={showPromptManager}
                                        block
                                    >
                                        管理提示词
                                    </Button>
                                </div>
                            </>
                        )}
                    >
                        {prompts.map(prompt => (
                            <Option key={prompt.id ?? 'default'} value={prompt.id ?? null}>
                                <Tooltip
                                    placement='rightBottom'
                                    title={prompt.description}>
                                    <span>{prompt.name}</span>
                                </Tooltip>
                            </Option>
                        ))}
                    </Select>

                    {/* 提示词管理对话框 */}
                    <Modal
                        title={modalMode === ModalMode.LIST ? "提示词管理" : "添加提示词"}
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        width={modalMode === ModalMode.LIST ? 700 : 520}
                        footer={modalMode === ModalMode.LIST ? [
                            <Button key="close" onClick={() => setIsModalVisible(false)}>
                                关闭
                            </Button>
                        ] : [
                            <Button key="back" onClick={backToList}>
                                取消
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleCreatePrompt}>
                                添加
                            </Button>
                        ]}
                    >
                        {modalMode === ModalMode.LIST ? renderPromptList() : renderAddPromptForm()}
                    </Modal>
                </>
            )}
        </>
    );
};

export default UserPrompt;