import { useState, useEffect } from 'react';
import { Button, Form, Input, Typography, theme, Divider, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LoginInput } from '@/types/Auth';
import { AuthLogin, OAuths } from '@/apis/Auth';
import TypewriterEffect from '@/features/TypewriterEffect';
import { Flexbox } from 'react-layout-kit';
import Verification from '@/apis/Verification';
import { getIconByName } from '@/utils/iconutil';
const { Text, Link } = Typography;

export default function Mobile() {
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
                
                // 检查URL中是否存在redirect参数
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
                        text="放大你的想法"
                        style={{
                            fontSize: '24px',
                            marginBottom: '4px',
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
                    size="small"
                >
                    <Form.Item
                        name="userName"
                        rules={[{ required: true, message: '请输入你的用户名或工作邮箱' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input
                            placeholder="输入你的用户名或工作邮箱"
                            style={{ height: '36px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入你的密码' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input.Password
                            placeholder="输入你的密码"
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
                        登录
                    </Button>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '12px'
                    }}>
                        <Link href="/auth/reset-password" style={{ textAlign: 'center' }}>忘记密码</Link>

                        <div style={{ textAlign: 'center' }}>
                            如果还没有账号，请
                            <Link href="/auth/register">
                                注册
                            </Link>
                        </div>
                    </div>
                    
                    <Divider plain style={{ margin: '8px 0' }}>或</Divider>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '12px'
                    }}>
                        {oauths.map((oauth) => (
                            <Button
                                key={oauth.clientId}
                                icon={getIconByName(oauth.icon)}
                                size="small"
                                block
                                style={{ height: '32px' }}
                                onClick={() => handleOAuthLogin(oauth.provider, oauth.clientId)}
                            >
                                继续使用{oauth.provider}
                            </Button>
                        ))}
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
                    
                    <Button
                        type="text"
                        size="small"
                        style={{
                            marginTop: '16px',
                            display: 'block',
                            margin: '16px auto 0',
                            fontSize: '12px',
                            padding: '0 8px',
                            height: '24px'
                        }}
                    >
                        了解更多 ↓
                    </Button>
                </Form>
            </div>
        </div>
    );
}
