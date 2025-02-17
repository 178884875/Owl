import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { createChannel } from '@/apis/ModelaChannel';

interface CreateChannelProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChannel: React.FC<CreateChannelProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await createChannel(values);
      message.success('渠道创建成功');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('创建渠道失败:', error);
      message.error('创建渠道失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="创建新渠道"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="渠道名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="provider" label="模型提供商" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="openai">OpenAI</Select.Option>
            <Select.Option value="anthropic">Anthropic</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="endpoint" label="提供商地址" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="渠道描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="enabled" label="是否启用" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateChannel; 