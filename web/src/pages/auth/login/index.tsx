import { Flexbox } from 'react-layout-kit';
import { Input, Button, Checkbox, Form, notification } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookFilled, GithubOutlined } from '@ant-design/icons';
import './index.css'; // 创建对应的CSS文件

import LoginIamge from '../../../assets/login.png'
import { useEffect, useState } from 'react';
import Verification from '../../../apis/Verification';
import { LoginInput } from '../../../types/Auth';
import AuthLogin from '../../../apis/Auth';

export default function Login() {
    const [loading, setLoading] = useState(false)

    const [codeImage, setCodeImage] = useState({
        code: '',
        id: ''
    })

    const onFinish = async (values: LoginInput) => {
        setLoading(true)

        try {
            values.codeId = codeImage.id
            const result = await AuthLogin(values)
            console.log(result);

            if (result.success) {
                localStorage.setItem('token', result.data)
                window.location.href = '/'
            } else {
                notification.error({
                    message: '错误',
                    description: result.message
                })
                notification.open({
                    message: 'Notification Title',
                    description:
                      'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
                    onClick: () => {
                      console.log('Notification Clicked!');
                    },
                  });
            }

        } catch (e) {

        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        loadCodeImage()
    }, [])

    function loadCodeImage() {
        Verification('login')
            .then(res => {
                if (res.success) {
                    setCodeImage(res.data)
                } else {
                    notification.error({
                        message: '错误',
                        description: res.message
                    })
                }
            })
    }

    return (
        <Flexbox horizontal className="login-container">
            <div className="login-banner">
                <img
                    src={LoginIamge}
                    alt="login-banner"
                    className="banner-image"
                />
            </div>
            <div className="login-form-container">
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <span className='form-header'>
                        Thor Chat
                    </span>
                    <h2 className="form-title">
                        欢迎登录
                    </h2>
                    <p className="form-subtitle">
                        请填写您的用户名和密码登录
                    </p>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入您的用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="请输入您的用户名"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入您的密码' }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="请输入您的密码"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name='code'
                        rules={[{ required: true, message: '请输入验证码' }]}
                    >
                        <Input
                            placeholder="请输入验证码"
                            suffix={<img
                                style={{
                                    width: 100,
                                    height: 40,
                                    cursor: 'pointer'
                                }}
                                onClick={loadCodeImage}
                                src={codeImage.code} alt="code" />}
                            size="large"
                        />
                    </Form.Item>
                    <Flexbox horizontal gap={5}
                        style={{
                            marginBottom: 24
                        }}
                        justify="space-between" className="form-options">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <a className="login-form-forgot" href="">
                            忘记密码？
                        </a>
                    </Flexbox>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            className="login-form-button"
                            size="large"
                        >
                            登录
                        </Button>
                    </Form.Item>
                    <div className="social-login">
                        <p className="divider">
                            其他登录方式
                        </p>
                        <Flexbox horizontal gap={16} className="social-icons">
                            <Button shape="circle" icon={<GoogleOutlined />} />
                            <Button shape="circle" icon={<FacebookFilled />} />
                            <Button shape="circle" icon={<GithubOutlined />} />
                        </Flexbox>
                    </div>
                </Form>
            </div>
        </Flexbox>
    );
}