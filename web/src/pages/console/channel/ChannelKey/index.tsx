import { Flexbox } from "react-layout-kit";
import { Typography, Button, message, Table, Modal, Form, Input, InputNumber, Popconfirm } from "antd";
import { ChannelItem } from "../ChannelList";
import { useState, useEffect } from "react";
import { getChannelKey, updateChannelKey } from "@/apis/ModelaChannel";

interface ChannelKeyProps {
    channel: ChannelItem | null;
}

export default function ChannelKey({ channel }: ChannelKeyProps) {
    const [data, setData] = useState<any[]>([]);
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
        render: (_: string, record: any) => (
            <Popconfirm
                title="确定要删除这个密钥吗？"
                onConfirm={() => handleDeleteKey(record.key)}
                okText="确定"
                cancelText="取消"
            >
                <Button type="link">删除</Button>
            </Popconfirm>
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

    const handleOpenKey = () => {
        switch (channel?.provider) {
            case 'OpenAI':
                window.open('https://platform.openai.com/api-keys', '_blank');
                break;
            case 'GiteeAI':
                window.open('https://ai.gitee.com/hejiale010426/dashboard/settings/tokens', '_blank');
                break;
            case 'CoresHub':
                window.open('https://console.coreshub.cn/xb3/maas/global-keys/', '_blank');
                break;
            case 'BaiduCloud':
                window.open('https://console.bce.baidu.com/iam/#/iam/apikey/list', '_blank');
                break;
            case 'DeepSeek':
                window.open('https://platform.deepseek.com/api_keys', '_blank');
                break;
            case 'Anthropic':
            case 'Claude':
                window.open('https://console.anthropic.com/settings/keys', '_blank');
                break;
            case 'Volcengine':
                window.open('https://www.volcengine.com/experience/ark?utm_term=202502dsinvite&ac=DSASUQY5&rc=DB4II4FC', '_blank');
                break;
            case 'Azure':
                window.open('https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/OpenAI', '_blank');
                break;
            case 'Google':
                window.open('https://aistudio.google.com/app/apikey', '_blank');
                break;
            case 'Github':
                window.open('https://github.com/settings/tokens', '_blank');
                break;
            case 'Moonshot':
                window.open('https://platform.moonshot.cn/console/api-keys', '_blank');
                break;
            case 'Nvidia':
                window.open('https://build.nvidia.com/meta/llama-3_1-405b-instruct', '_blank');
                break;
            case 'TokenAI':
                window.open('https://api.token-ai.cn/token', '_blank');
                break;
            default:
                message.error('暂未支持该模型服务的APIKey获取方式');
        }
    }

    return (
        <Flexbox>
            <Flexbox horizontal justify="space-between" align="center">
                <Typography.Title level={5}>模型服务APIKey</Typography.Title>
                <Flexbox horizontal gap={16}>
                    <Typography.Text style={{
                        color: '#1677ff',
                        cursor: 'pointer',
                        margin: 8,
                    }} onClick={handleOpenKey}>
                        点击这里获取密钥
                    </Typography.Text>
                    <Button type="primary" onClick={openModal}>添加密钥</Button>
                </Flexbox>
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
