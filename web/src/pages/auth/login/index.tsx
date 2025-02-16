import { useEffect, useState } from 'react';
import { Input, Button, Checkbox, Form, notification } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { LoginInput } from '../../../types/Auth';
import AuthLogin from '../../../apis/Auth';
import { useUserStore } from '@/store/user/store';
import Verification from '../../../apis/Verification';
import './index.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [SignIn] = useUserStore(state => [state.SignIn]);
    const [codeImage, setCodeImage] = useState({
        code: '',
        id: ''
    });

    const loadCodeImage = async () => {
        try {
            const res = await Verification('login');
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

    const onFinish = async (values: LoginInput) => {
        setLoading(true);
        try {
            const result = await AuthLogin({
                ...values,
                codeId: codeImage.id
            });

            if (result.success) {
                SignIn(result.data);
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
                description: '登录失败，请稍后重试'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="cyber-background">
                <div className="cyber-grid"></div>
                <div className="stars-container">
                    <div className="stars-group">
                        {[...Array(100)].map((_, i) => {
                            const left = Math.random() * 100;
                            const top = Math.random() * 100;
                            const delay = Math.random() * 3;

                            return (
                                <div
                                    key={`small-${i}`}
                                    className="star star-small"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        animationDelay: `${delay}s`
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div className="stars-group">
                        {[...Array(50)].map((_, i) => {
                            const left = Math.random() * 100;
                            const top = Math.random() * 100;
                            const delay = Math.random() * 5;

                            return (
                                <div
                                    key={`medium-${i}`}
                                    className="star star-medium"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        animationDelay: `${delay}s`
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div className="stars-group">
                        {[...Array(25)].map((_, i) => {
                            const left = Math.random() * 100;
                            const top = Math.random() * 100;
                            const delay = Math.random() * 7;

                            return (
                                <div
                                    key={`large-${i}`}
                                    className="star star-large"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        animationDelay: `${delay}s`
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* 流星群 */}
                    {[...Array(5)].map((_, i) => {
                        const top = Math.random() * 50;
                        const left = Math.random() * 50;
                        const duration = Math.random() * 2 + 2;
                        const delay = Math.random() * 10;

                        return (
                            <div
                                key={`meteor-${i}`}
                                className="meteor"
                                style={{
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    // @ts-ignore
                                    '--duration': `${duration}s`,
                                    animationDelay: `${delay}s`
                                }}
                            />
                        );
                    })}

                    {/* 星云效果 */}
                    <div className="nebula"></div>
                </div>
            </div>

            <div className="login-container">
                <div className="login-content">
                    <div className="logo-container">
                        <div className="cyber-circle"></div>
                        <h1 className="form-header">Thor Chat</h1>
                    </div>
                    <h2 className="form-title">欢迎登录</h2>
                    <p className="form-subtitle">请填写您的用户名和密码登录</p>
                    <Form
                        form={form}
                        name="login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <div className="cyber-input-group">
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: '请输入您的用户名' }]}
                            >
                                <Input
                                    size='large'
                                    prefix={<UserOutlined className="site-form-item-icon" />}
                                    placeholder="请输入用户名"
                                    className="cyber-input"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: '请输入您的密码' }]}
                            >
                                <Input.Password
                                    size='large'
                                    prefix={<LockOutlined className="site-form-item-icon" />}
                                    placeholder="请输入密码"
                                    className="cyber-input"
                                />
                            </Form.Item>

                            <Form.Item
                                name="code"
                                rules={[{ required: true, message: '请输入验证码' }]}
                            >
                                <Input
                                    placeholder="请输入验证码"
                                    className="cyber-input"
                                    suffix={
                                        <img
                                            style={{
                                                width: 100,
                                                height: 32,
                                                cursor: 'pointer'
                                            }}
                                            onClick={loadCodeImage}
                                            src={codeImage.code}
                                            alt="验证码"
                                        />
                                    }
                                />
                            </Form.Item>
                        </div>

                        <div className="form-options">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox className="cyber-checkbox">记住我</Checkbox>
                            </Form.Item>
                            <Button type="link" className="forgot-link">忘记密码？</Button>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="cyber-button"
                                block
                                loading={loading}
                            >
                                登录
                            </Button>
                        </Form.Item>

                        <div className="other-login">
                            <div className="cyber-divider">其他登录方式</div>
                            <div className="social-icons">
                                <Button
                                    type="text"
                                    icon={<GoogleOutlined />}
                                    className="cyber-social-button"
                                />
                                <Button
                                    type="text"
                                    icon={<GithubOutlined />}
                                    className="cyber-social-button"
                                />
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;