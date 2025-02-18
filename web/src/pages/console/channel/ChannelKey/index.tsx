import { Flexbox } from "react-layout-kit";
import { Typography, Button, message, Table, Modal, Form, Input, InputNumber } from "antd";
import { ChannelItem } from "../ChannelList";
import { useState, useEffect } from "react";
import { getChannelKey, updateChannelKey } from "@/apis/ModelaChannel";

interface ChannelKeyProps {
    channel: ChannelItem | null;
}

export default function ChannelKey({ channel }: ChannelKeyProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [form] = Form.useForm();

    const columns = [{
        title: '密钥',
        dataIndex: 'key',
        key: 'key',
    }, {
        title: '权重',
        dataIndex: 'order',
        key: 'order',
    }, {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
    }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text: string, record: any) => (
            <Button type="link" onClick={() => handleDeleteKey(record.key)}>删除</Button>
        ),
    }]

    useEffect(() => {
        if (!channel?.id) {
            setData([]);
            return;
        }
        getChannelKey(channel?.id).then((res) => {
            setData(res.data);
        });
    }, [channel]);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleAddKey = async () => {
        try {
            if (!channel?.id) {
                message.error('渠道ID不存在');
                return;
            }

            const values = await form.validateFields();
            if (data.find((item) => item.key === values.key)) {
                message.error('密钥已存在');
                return;
            }
            const newKey = {
                key: values.key,
                order: values.order,
                description: values.description || '无',
            };

            data.push(newKey);
            await updateChannelKey(channel?.id, data);

            message.success('密钥添加成功');
            closeModal();
        } catch (error) {
            console.log(error);

            message.error('请填写表单内容');
        }
    };

    const handleDeleteKey = async (key: string) => {
        if (!channel?.id) {
            message.error('渠道ID不存在');
            return;
        }
        const newData = data.filter((item) => item.key !== key);
        await updateChannelKey(channel?.id, newData);
        message.success('密钥删除成功');
        setData(newData);
    };

    return (
        <Flexbox>
            <Flexbox horizontal justify="space-between" align="center">
                <Typography.Title level={5}>渠道密钥管理</Typography.Title>
                <Button type="primary" onClick={openModal}>添加密钥</Button>
            </Flexbox>

            <Flexbox>
                <Table columns={columns} dataSource={data} />
            </Flexbox>

            <Modal
                title="添加密钥"
                open={isModalVisible}
                onCancel={closeModal}
                onOk={handleAddKey}
                okText="提交"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="密钥"
                        name="key"
                        rules={[{ required: true, message: '请输入密钥' }]}
                    >
                        <Input placeholder="请输入密钥" />
                    </Form.Item>
                    <Form.Item
                        label="权重"
                        name="order"
                        initialValue={1}
                        rules={[{ required: true, message: '请输入权重' }]}
                    >
                        <InputNumber placeholder="请输入权重" />
                    </Form.Item>
                    <Form.Item
                        label="描述"
                        name="description"
                    >
                        <Input.TextArea placeholder="请输入密钥描述（可选）" />
                    </Form.Item>
                </Form>
            </Modal>
        </Flexbox>
    );
}
