import { useState, useEffect } from 'react';
import { Button, Form, Input, Typography, theme, Divider, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LoginInput } from '@/types/Auth';
import { AuthLogin, OAuths } from '@/apis/Auth';
import TypewriterEffect from '@/features/TypewriterEffect';
import { Flexbox } from 'react-layout-kit';
import Verification from '@/apis/Verification';
import { getIconByName } from '@/utils/iconutil';
const {  Text, Link } = Typography;

export default function Desktop() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [oauths, setOauths] = useState<any[]>([]);
    const [codeImage, setCodeImage] = useState({
        code: '',
        id: ''
    });

    useEffect(() => {
        const loadOauths = async () => {
            const res = await OAuths();
            setOauths(res.data);
        };
        loadOauths();
    }, []);

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
                notification.success({
                    message: '成功',
                    description: '登录成功'
                });
                localStorage.setItem('token', result.data);
                
                const urlParams = new URLSearchParams(window.location.search);
                const redirectPath = urlParams.get('redirect');
                if (redirectPath) {
                    // 如果存在redirect参数，则跳转到该参数指定的页面
                    navigate(decodeURIComponent(redirectPath));
                } else {
                    // 否则跳转到首页
                    navigate('/');
                }
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

    const handleOAuthLogin = async (provider: string, clientId: string) => {
        // 判断provider是哪种OAuth
        if (provider === 'Google') {
            // 跳转到Google登录页面
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/oauth?type=google&response_type=code&scope=email profile`;
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: token.colorBgContainer
        }}>
            <div style={{
                maxWidth: '480px',
                width: '100%',
                padding: '40px 20px',
            }}>
                <Flexbox
                    gap={16}
                    style={{
                        textAlign: 'center',
                        marginBottom: '48px'
                    }}>
                    <img
                        src="/logo.png"
                        width={48}
                        alt="Logo"
                        style={{
                            marginBottom: '24px',
                            margin: '0 auto',
                            display: 'block'
                        }}
                    />
                    <TypewriterEffect
                        text="放大你的想法"
                        style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                            fontFamily: 'serif'
                        }}
                    >
                    </TypewriterEffect>
                </Flexbox>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    style={{ width: '100%' }}
                >
                    <Form.Item
                        name="userName"
                        rules={[{ required: true, message: '请输入你的用户名或工作邮箱' }]}
                    >
                        <Input
                            size="large"
                            placeholder="输入你的用户名或工作邮箱"
                            style={{ height: '48px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入你的密码' }]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="输入你的密码"
                            style={{ height: '48px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        rules={[{ required: true, message: '请输入验证码' }]}
                    >
                        <Input
                            size="large"
                            placeholder="验证码"
                            style={{ height: '48px' }}
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

                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        htmlType="submit"
                        style={{
                            height: '48px',
                            backgroundColor: token.colorPrimary,
                            marginBottom: '24px'
                        }}
                    >
                        登录
                    </Button>
                    <Flexbox
                        horizontal
                        gap={16}
                        style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
                        <Link href="/auth/reset-password">忘记密码</Link>

                        <span>
                            如果还没有账号，请
                            <Link href="/auth/register">
                                注册
                            </Link>
                        </span>
                    </Flexbox>
                    <Divider plain>或</Divider>
                    <Flexbox style={{
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }} horizontal gap={16}>
                        {oauths.map((oauth) => (
                            <Button
                                key={oauth.clientId}
                                icon={getIconByName(oauth.icon)}
                                size="large"
                                onClick={() => handleOAuthLogin(oauth.provider, oauth.clientId)}
                            >

                                继续使用{oauth.provider}
                            </Button>
                        ))}
                    </Flexbox>
                    <Text style={{
                        fontSize: '14px',
                        color: token.colorTextSecondary,
                        textAlign: 'center',
                        display: 'block'
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
                    <Button
                        type="text"
                        style={{
                            marginTop: '48px',
                            display: 'block',
                            margin: '48px auto 0'
                        }}
                    >
                        了解更多 ↓
                    </Button>
                </Form>
            </div>
        </div>
    );
}
