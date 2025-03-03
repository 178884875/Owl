import  { useState, useEffect } from 'react';
import { Table, Space, Input, Button, Popconfirm, message, Tag, Dropdown, Menu, Modal, Form, Select } from 'antd';
import { getUserList, deleteUser, resetPassword, enableUser, disableUser, addUser } from '../../../apis/User';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isResetPasswordModalVisible, setIsResetPasswordModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchUsers = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await getUserList(search, page, pageSize);
            setUsers(response.data.data);
            setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize,
                total: response.data.totalCount || 0,
            });
        } catch (error) {
            message.error('获取用户列表失败');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = () => {
        fetchUsers(1, pagination.pageSize, searchText);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            message.success('删除用户成功');
            fetchUsers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            message.error('删除用户失败');
        }
    };

    const handleEdit = (id: string) => {
        console.log('编辑用户:', id);
    };

    const showResetPasswordModal = (id: string) => {
        setCurrentUserId(id);
        setNewPassword('');
        setIsResetPasswordModalVisible(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            message.error('请输入新密码');
            return;
        }
        try {
            await resetPassword({ id: currentUserId, password: newPassword });
            message.success('密码重置成功');
            setIsResetPasswordModalVisible(false);
        } catch (error) {
            message.error('密码重置失败');
        }
    };

    const handleEnable = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                const result = await disableUser(id);
                if (result.success) {
                    message.success('用户已禁用');
                    fetchUsers(pagination.current, pagination.pageSize, searchText);
                } else {
                    message.error(result.message);
                }
            } else {
                const result = await enableUser(id);
                if (result.success) {
                    message.success('用户已启用');
                    fetchUsers(pagination.current, pagination.pageSize, searchText);
                } else {
                    message.error(result.message);
                }
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    const showAddUserModal = () => {
        form.resetFields();
        setIsAddUserModalVisible(true);
    };

    const handleAddUser = async (values: any) => {
        try {
            const result = await addUser(values);
            if (result.success) {
                message.success('添加用户成功');
                setIsAddUserModalVisible(false);
                fetchUsers(1, pagination.pageSize, searchText);
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('添加用户失败');
        }
    };

    const columns = [
        {
            title: '头像',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar: string) => <img src={avatar} alt="头像" style={{ width: 50, height: 50, borderRadius: '50%' }} />,
        },
        {
            title: '用户名',
            dataIndex: 'displayName',
            key: 'displayName',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '是否启用',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => {
                if (enabled) {
                    return <Tag color="success">启用</Tag>
                } else {
                    return <Tag color="default">禁用</Tag>
                }
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Dropdown overlay={
                    <Menu>
                        <Menu.Item key="edit">
                            <a onClick={() => handleEdit(record.id)}>编辑</a>
                        </Menu.Item>
                        <Menu.Item key="resetPassword">
                            <a onClick={() => showResetPasswordModal(record.id)}>重置密码</a>
                        </Menu.Item>
                        <Menu.Item key="enable">
                            <a onClick={() => handleEnable(record.id, record.enabled)}>
                                {record.enabled ? '禁用' : '启用'}
                            </a>
                        </Menu.Item>
                        <Menu.Item key="delete">
                            <Popconfirm
                                title="确定要删除这个用户吗?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="是"
                                cancelText="否"
                            >
                                <a style={{ color: 'red' }}>删除</a>
                            </Popconfirm>
                        </Menu.Item>
                    </Menu>
                }>
                    <Button icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <h1>用户管理</h1>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="搜索用户"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button type="primary" onClick={handleSearch}>
                    搜索
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={showAddUserModal}>
                    添加用户
                </Button>
            </Space>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{
                        total: pagination.total,
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    loading={loading}
                    onChange={(newPagination) => 
                        fetchUsers(newPagination.current, newPagination.pageSize, searchText)
                    }
                />
            </div>
            <Modal
                title="重置密码"
                visible={isResetPasswordModalVisible}
                onOk={handleResetPassword}
                onCancel={() => setIsResetPasswordModalVisible(false)}
            >
                <Input.Password
                    placeholder="请输入新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </Modal>
            <Modal
                title="添加用户"
                open={isAddUserModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsAddUserModalVisible(false)}
            >
                <Form form={form} onFinish={handleAddUser} layout="vertical">
                    <Form.Item
                        name="displayName"
                        label="昵称"
                        rules={[{ required: true, message: '请输入显示昵称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="userName"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[{ required: true, message: '请输入手机号' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="passwordHash"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="角色"
                        initialValue="User"
                        rules={[{ required: true, message: '请选择用户角色' }]}
                    >
                        <Select placeholder="请选择用户角色">
                            <Option value="Admin">管理员</Option>
                            <Option value="User">普通用户</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}


