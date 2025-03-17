import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spin, Card, Typography, Space, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { Callback } from "../../../apis/Auth";

const { Title, Text } = Typography;

export default function OAuth() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type');
    // const clientId = searchParams.get('clientId');
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (type && code) {
            const redirectUri = window.location.origin + window.location.pathname + "?type=" + type;
            Callback(type, (code || token)!, redirectUri)
                .then((response) => {
                    if (response.success) {
                        message.success('登录成功');
                        localStorage.setItem('token', response.data);
                        navigate('/');
                    } else {
                        message.error('登录失败：' + response.message);
                        // 跳转登录页面
                        navigate('/auth/login');
                    }
                })
                .catch((error) => {
                    message.error('登录失败：' + error.message);
                    // 跳转登录页面
                    navigate('/auth/login');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        else if (type && token) {
            const redirectUri = window.location.origin + window.location.pathname + "?type=" + type;
            Callback(type, token, redirectUri)
                .then((response) => {
                    if (response.success) {
                        message.success('登录成功');
                        localStorage.setItem('token', response.data);
                        navigate('/');
                    } else {
                        message.error('登录失败：' + response.message);
                        // 跳转登录页面
                        navigate('/auth/login');
                    }
                })
                .catch((error) => {
                    message.error('登录失败：' + error.message);
                    // 跳转登录页面
                    navigate('/auth/login');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        else {
            setLoading(false);
        }
    }, [type, code, navigate]);

    const getLoginTypeInfo = () => {
        switch (type) {
            case 'google':
                return {
                    icon: <GoogleOutlined style={{ fontSize: 24, color: '#4285F4' }} />,
                    name: 'Google'
                };
            // 可以添加其他登录类型
            default:
                return {
                    icon: null,
                    name: '第三方'
                };
        }
    };

    const { icon, name } = getLoginTypeInfo();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f2f5'
        }}>
            <Card style={{
                width: 400,
                textAlign: 'center',
                padding: '24px'
            }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {icon}
                    <Title level={3}>登录跳转中</Title>
                    <Text type="secondary">
                        正在跳转到{name}登录页面，请稍候...
                    </Text>

                    {loading && <Spin size="large" />}
                </Space>
            </Card>
        </div>
    );
}