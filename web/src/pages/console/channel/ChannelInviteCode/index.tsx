import { Flexbox } from "react-layout-kit";
import { Button, Table, Typography, Tag, Modal, Form, DatePicker, InputNumber, message, Dropdown } from "antd";
import { useState, useEffect } from "react";
import { createChannelInviteCode, deleteChannelInviteCode, getInviteCodeList } from "@/apis/ModelaChannel";
import { ChannelItem } from "../ChannelList";
import { EllipsisOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
export interface ChannelInviteCodeProps {
    channel: ChannelItem;
}

export default function ChannelInviteCode({ channel }: ChannelInviteCodeProps) {
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await getInviteCodeList(channel.id);
            setDataSource(response.data || []);
        } catch (error) {
            console.error("获取渠道列表失败", error);
            message.error("获取渠道列表失败");
        }
    };

    const columns = [
        {
            title: '邀请码',
            dataIndex: 'code',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
        },
        {
            title: '状态',
            dataIndex: 'status',
        },
        {
            title: '过期时间',
            dataIndex: 'expireTime',
        },
        {
            title: '是否已使用',
            dataIndex: 'isUsed',
            render: (text: boolean) => text ? '是' : '否',
        },
        {
            title: '使用人数',
            dataIndex: 'usedCount',
        },
        {
            title: '最大使用人数',
            dataIndex: 'maxUseCount',
        },
        {
            title: '是否启用',
            dataIndex: 'enabled',
            render: (text: boolean) => text ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
        },
        {
            title: '操作',
            dataIndex: 'action',
            render: (_: any, record: any) => (
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                label: '删除',
                                key: 'delete',
                                danger: true,
                                onClick: () => handleDeleteInviteCode(record.id)
                            },
                            {
                                label: '复制邀请连接',
                                key: 'copy',
                                onClick: () => handleCopyInviteCode(record.id)
                            },
                        ],
                    }}>
                    <Button type="link">
                        <EllipsisOutlined />
                    </Button>
                </Dropdown>
            ),
        },
    ];

    const handleDeleteInviteCode = async (id: number) => {
        await deleteChannelInviteCode(id);
        message.success("删除成功");
        fetchChannels();
    };

    const handleCopyInviteCode = (id: number) => {
        const inviteCode = dataSource.find(item => item.id === id)?.code;
        if (inviteCode) {
            navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteCode}`);
            message.success("邀请连接已复制到剪贴板");
        } else {
            message.error("邀请连接不存在");
        }
    };

    const handleCreateInviteCode = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            values.channelId = channel.id;
            const response = await createChannelInviteCode(values);
            if (response.success) {
                message.success("邀请码创建成功");
                setIsModalVisible(false);
                form.resetFields();
                fetchChannels();
            } else {
                message.error(response.message || "创建失败");
            }
        } catch (error) {
            console.error("表单验证失败", error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <Flexbox>
            <Flexbox
                horizontal
                style={{
                    width: '100%',
                    justifyContent: 'space-between',
                }}
                gap={16}
            >
                <Typography.Text
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                    }}
                >
                    渠道用户邀请码
                </Typography.Text>
                <Button onClick={handleCreateInviteCode}>生成邀请码</Button>
            </Flexbox>
            <Flexbox
                style={{
                    marginTop: 16,
                    borderRadius: 8,
                    padding: 16,
                }}
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="code"
                />
            </Flexbox>
            <Modal
                title="生成邀请码"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item
                        name="expireTime"
                        label="过期时间"
                        initialValue={dayjs().add(14, 'day')}
                        rules={[{ required: true, message: '请选择过期时间' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="maxUseCount"
                        label="最大使用次数"
                        initialValue={100}
                        rules={[{ required: true, message: '请输入最大使用次数' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="quota"
                        initialValue={-1}
                        label="可使用额度（-1为不限制）"
                        rules={[{ required: true, message: '请输入可使用额度' }]}
                    >
                        <InputNumber
                            min={-1}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                                if (value === -1) {
                                    form.setFieldsValue({ quota: -1 });
                                }
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Flexbox>
    );
}


