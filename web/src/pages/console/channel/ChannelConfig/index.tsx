import { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, message, Button, Popover } from 'antd';
import { Flexbox } from "react-layout-kit";
import { Typography } from "antd";
import { ChannelItem } from "../ChannelList";
import { updateChannel } from '@/apis/ModelaChannel'; // 假设有一个更新渠道的API
import { iconMap, getIconByName } from '@/utils/iconutil';
import SelectModel from '@/features/SelectModel';
import Channel from '../Channel';

interface ChannelConfigProps {
    channel: ChannelItem | null;
}

export default function ChannelConfig({ channel }: ChannelConfigProps) {
    const [form] = Form.useForm();
    const [modelIds, setModelIds] = useState<string[]>(channel?.modelIds || []);
    const [selectedIcon, setSelectedIcon] = useState<string>(channel?.avatar || 'OpenAI');

    useEffect(() => {
        if (channel) {
            form.setFieldsValue(channel);
            setModelIds(channel.modelIds);
            setSelectedIcon(channel.avatar || 'OpenAI');
        } else {
            form.setFieldsValue({
                enabled: true,
            });
        }
    }, [channel, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.modelIds = modelIds;
            values.id = channel?.id;
            await updateChannel(values);
            message.success('渠道更新成功');
        } catch (error) {
            console.error('更新渠道失败:', error);
            message.error('更新渠道失败，请重试');
        }
    };

    if (!channel) {
        return (
            <Flexbox>
                <Typography.Text>
                    请选择一个渠道
                </Typography.Text>
            </Flexbox>
        );
    }

    return (
        <Flexbox gap={16} style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
        }}>
            <Flexbox>
                <Typography.Text>
                    渠道配置
                </Typography.Text>
            </Flexbox>

            <Form form={form}
                disabled={channel.isShare}
                layout="vertical" onFinish={handleSubmit}>
                <Form.Item name='avatar' label='渠道头像'>
                    <Popover
                        content={
                            <Flexbox
                                gap={8}
                                style={{
                                    maxWidth: 400,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    padding: 8
                                }}
                                horizontal
                                wrap='wrap'
                            >
                                {Object.keys(iconMap).map((iconName) => (
                                    <div
                                        key={iconName}
                                        onClick={() => {
                                            setSelectedIcon(iconName);
                                            form.setFieldsValue({ avatar: iconName });
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            padding: 4,
                                            border: selectedIcon === iconName ? '2px solid var(--color-primary)' : '2px solid transparent',
                                            borderRadius: 8,
                                        }}
                                    >
                                        {getIconByName(iconName, 24)}
                                    </div>
                                ))}
                            </Flexbox>
                        }
                        trigger="click"
                        placement="bottom"
                    >
                        <Button style={{ width: 'fit-content' }}>
                            {getIconByName(selectedIcon, 24)}
                            <span style={{ marginLeft: 8 }}>选择图标</span>
                        </Button>
                    </Popover>
                </Form.Item>
                <Form.Item name="name" label="渠道名称" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="provider" label="模型提供商" rules={[{ required: true }]}>
                    <Select
                        options={Channel.map(x => {
                            return {
                                label: <Flexbox gap={8} horizontal>
                                    {x.icon}
                                    <span>{x.name}</span>
                                </Flexbox>,
                                value: x.id,
                            }
                        })}
                    >
                    </Select>
                </Form.Item>
                {!channel.isShare && (
                    <Form.Item name="endpoint" label="提供商地址" rules={[{ required: true }, {
                        validator(_, value, callback) {
                            if (value && !value.startsWith('http')) {
                                callback('请输入正确的URL');
                            }
                            callback();
                        }
                    }]}>
                        <Input />
                    </Form.Item>)}
                <Form.Item name="modelIds" label="模型列表">
                    <SelectModel modelIds={modelIds} onSelect={(modelIds) => {
                        setModelIds([...modelIds]);
                    }} >
                    </SelectModel>
                </Form.Item>
                <Form.Item name="tags" label="模型标签">
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="请输入模型标签"
                    />
                </Form.Item>
                <Form.Item name="description" label="渠道描述">
                    <Input.TextArea />
                </Form.Item>
                {
                    !channel.isShare && (<>
                        <Form.Item name="enabled" label="是否启用" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                block
                                type="primary" htmlType="submit">
                                保存
                            </Button>
                        </Form.Item>
                    </>)
                }
            </Form>
        </Flexbox>
    );
}
