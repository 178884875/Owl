import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, message, Button, Popover, Tooltip } from 'antd';
import { createChannel } from '@/apis/ModelaChannel';
import Channel from '../Channel';
import { Flexbox } from 'react-layout-kit';
import SelectModel from '@/features/SelectModel';
import { iconMap, getIconByName } from '@/utils/iconutil';
import { LoadingOutlined } from '@ant-design/icons';
import { RotateCw } from 'lucide-react';
import { useChatStore } from '@/store/chat';
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
  const [loadingRemoteModel, setLoadingRemoteModel] = useState(false);
  const [loadEnabledModels, models] = useChatStore(state => [state.loadEnabledModels, state.chatModels]);

  useEffect(() => {
    loadEnabledModels();
  }, []);

  const loadRemoteModel = async () => {
    setLoadingRemoteModel(true);
    // 获取provider | 如果provider为空，则提示用户选择provider
    const provider = form.getFieldValue('provider');
    if (!provider) {
      message.error('请选择模型提供商');
      setLoadingRemoteModel(false);
      return;
    }

    // endpoint
    const endpoint = form.getFieldValue('endpoint');
    // 正则表达式 http或者https开头
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!regex.test(endpoint)) {
      message.error('请输入正确的URL');
      setLoadingRemoteModel(false);
      return;
    }
    // 获取apiKey
    const apiKey = form.getFieldValue('apiKey');
    if (!apiKey) {
      message.error('请输入API Key');
      setLoadingRemoteModel(false);
      return;
    }

    setModelIds([]);

    if (provider === 'OpenAI') {
      // 获取模型列表
      // 解析endpoint,默认他是v1
      const url = endpoint + "/models";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const responseData = await response.json();

      // data.data
      const values = responseData.data.map((item: any) => item.id);

      const chatModelIds = values.map((id: string) => {
        for (const model of models || []) {
          const chatModel = model.models?.find((cm: any) => cm.modelId === id);
          if (chatModel) return chatModel.id;
        }
        return null;
      }).filter(Boolean);

      if (chatModelIds.length === 0) {
        message.error('没有找到模型');
        setLoadingRemoteModel(false);
        return;
      }
      // chatModelIds去重
      const uniqueModelIds = [...new Set(chatModelIds)] as string[];

      setModelIds(uniqueModelIds);
    }

    setLoadingRemoteModel(false);
  }

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
          validator(_, value, callback) {
            if (value && !value.startsWith('http')) {
              callback('请输入正确的URL');
            }
            callback();
          }
        }]}>
          <Input />
        </Form.Item>
        <Form.Item name="tags" label="模型标签">
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="请输入模型标签"
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          name='apiKey' label='API Key'>
          <Input />
        </Form.Item>
        <Form.Item name="modelIds"
          label={<Flexbox horizontal gap={8}>
            <span>模型列表</span>
            <Tooltip title='导入您当前渠道的所有模型'>
              <Button
                size='small'
                type="text" onClick={loadRemoteModel}>
                {loadingRemoteModel ? <LoadingOutlined
                  size={16}
                /> : <RotateCw
                  size={16}
                />}
              </Button>
            </Tooltip>
          </Flexbox>}>
          <SelectModel modelIds={modelIds} onSelect={(modelIds) => {
            setModelIds([...modelIds]);
          }} >
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