import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, message, Button, Popover } from 'antd';
import { createChannel } from '@/apis/ModelaChannel';
import Channel from '../Channel';
import { Flexbox } from 'react-layout-kit';
import SelectModel from '@/features/SelectModel';
import { iconMap, getIconByName } from '@/utils/iconutil';

interface CreateChannelProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChannel: React.FC<CreateChannelProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modelIds, setModelIds] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>('OpenAI');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      values.modelIds = modelIds;
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
        <Form.Item name="endpoint" label="提供商地址" rules={[{ required: true }, {
          validator(rule, value, callback) {
            if (value && !value.startsWith('http')) {
              callback('请输入正确的URL');
            }
            callback();
          }
        }]}>
          <Input />
        </Form.Item>
        <Form.Item name="modelIds" label="模型列表">
          <SelectModel modelIds={modelIds} onSelect={(modelId) => {
            if (modelIds.includes(modelId)) {
              setModelIds(modelIds.filter(x => x !== modelId));
            } else {
              setModelIds([...modelIds, modelId]);
            }
          }} >
            <Flexbox style={{
              fontSize: 16,
            }}>
              {modelIds.length > 0 ? '已选择' + modelIds.length + '个模型' : '选择渠道可用模型'}
            </Flexbox>
          </SelectModel>
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