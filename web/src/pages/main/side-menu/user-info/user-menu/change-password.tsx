import { ChangePassword } from "@/apis/User";
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 确保两次输入的新密码一致
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的新密码不一致');
        setLoading(false);
        return;
      }

      const response = await ChangePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });

      if (response) {
        message.success('密码修改成功');
        form.resetFields();
        onClose();
        
      }
    } catch (error) {
      console.error(error);
      message.error('密码修改失败，请检查旧密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password placeholder="请输入当前密码" />
        </Form.Item>
        
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度不能少于6个字符' }
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={onClose}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
} 