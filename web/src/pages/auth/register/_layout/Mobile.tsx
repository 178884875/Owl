import { useState, useEffect } from 'react';
import { Button, Form, Input, Typography, theme, notification } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { RegisterInput } from '@/types/Auth';
import { AuthRegister } from '@/apis/Auth';
import TypewriterEffect from '@/features/TypewriterEffect';
import { Flexbox } from 'react-layout-kit';
import Verification from '@/apis/Verification';

const { Text, Link } = Typography;

export default function Mobile() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [codeImage, setCodeImage] = useState({
        code: '',
        id: ''
    });

    const loadCodeImage = async () => {
        try {
            const res = await Verification('register');
            if (res.success) {
                setCodeImage(res.data);
            } else {
                notification.error({
                    message: '错误',
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: '错误',
                description: '验证码加载失败，请稍后重试'
            });
        }
    };

    useEffect(() => {
        loadCodeImage();
    }, []);

    const onFinish = async (values: RegisterInput) => {
        setLoading(true);
        try {
            const result = await AuthRegister({
                ...values,
                codeId: codeImage.id
            });

            if (result.success) {
                notification.success({
                    message: '成功',
                    description: '注册成功，请登录'
                });
                localStorage.setItem('token', result.data);
                navigate('/');
            } else {
                notification.error({
                    message: '错误',
                    description: result.message
                });
                loadCodeImage();
                form.setFieldValue('code', '');
            }
        } catch (error) {
            notification.error({
                message: '错误',
                description: '注册失败，请稍后重试'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: token.colorBgContainer,
            padding: '16px',
            overflowY: 'auto',
            maxHeight: '100vh'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '320px',
                padding: '16px 12px',
                margin: '0 auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: '8px',
                backgroundColor: token.colorBgContainer
            }}>
                <Flexbox
                    gap={4}
                    style={{
                        textAlign: 'center',
                        marginBottom: '16px'
                    }}>
                    <img
                        src="/logo.png"
                        width={28}
                        alt="Logo"
                        style={{
                            margin: '0 auto',
                            display: 'block'
                        }}
                    />
                    <TypewriterEffect
                        text="加入雷神咖啡"
                        style={{
                            fontSize: '22px',
                            marginBottom: '4px',
                            fontFamily: 'serif'
                        }}
                    />
                </Flexbox>

                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ width: '100%' }}
                    size="small"
                >
                    <Form.Item
                        name="displayName"
                        rules={[{ required: true, message: '请输入您的昵称' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input
                            placeholder="输入您的昵称"
                            prefix={<UserOutlined />}
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入您的用户名' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input
                            placeholder="输入您的用户名"
                            prefix={<UserOutlined />}
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入您的邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input
                            placeholder="输入您的邮箱"
                            prefix={<MailOutlined />}
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="passwordHash"
                        rules={[
                            { required: true, message: '请输入您的密码' },
                            { min: 6, message: '密码长度不能少于6个字符' },
                            { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字' }
                        ]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input.Password
                            placeholder="输入您的密码"
                            prefix={<LockOutlined />}
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['passwordHash']}
                        rules={[
                            { required: true, message: '请确认您的密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('passwordHash') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input.Password
                            placeholder="确认密码"
                            prefix={<LockOutlined />}
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        rules={[{ required: true, message: '请输入验证码' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input
                            placeholder="验证码"
                            style={{ height: '36px' }}
                            suffix={
                                <img
                                    style={{
                                        width: 70,
                                        height: 24,
                                        cursor: 'pointer'
                                    }}
                                    onClick={loadCodeImage}
                                    src={codeImage.code}
                                    alt="验证码"
                                />
                            }
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        size="small"
                        block
                        loading={loading}
                        htmlType="submit"
                        style={{
                            height: '36px',
                            backgroundColor: token.colorPrimary,
                            marginBottom: '12px'
                        }}
                    >
                        注册
                    </Button>

                    <div style={{ 
                        textAlign: 'center',
                        marginBottom: '12px'
                    }}>
                        已有账号？
                        <Link href="/auth/login">
                            立即登录
                        </Link>
                    </div>

                    <Text style={{
                        fontSize: '10px',
                        color: token.colorTextSecondary,
                        textAlign: 'center',
                        display: 'block',
                        lineHeight: '1.2'
                    }}>
                        继续使用，即表示你同意雷神咖啡的{' '}
                        <Link href="#" style={{ color: token.colorPrimary }}>
                            用户协议
                        </Link>
                        {' '}和{' '}
                        <Link href="#" style={{ color: token.colorPrimary }}>
                            使用政策
                        </Link>
                        , 并承认他们的{' '}
                        <Link href="#" style={{ color: token.colorPrimary }}>
                            隐私政策
                        </Link>
                        .
                    </Text>
                </Form>
            </div>
        </div>
    );
}
