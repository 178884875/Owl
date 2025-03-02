import { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Input, Divider, message } from 'antd';
import { UserAddOutlined, CopyOutlined, CheckOutlined, FireOutlined } from '@ant-design/icons';
import { joinChannel } from '@/apis/ModelaChannel';
import { useNavigate } from 'react-router-dom';
const { Title, Text, Paragraph } = Typography;

export default function Invite() {
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [particles, setParticles] = useState<any[]>([]);
    const inviteCode = "8ac21ff296b94f228425b0289f15fb64";
    const navigate = useNavigate();

    const handleJoinClick = async () => {
        const result = await joinChannel(inviteCode);

        if (!result.success) {
            message.error(result.message);

            return;
        }
        setShowEasterEgg(true);
        const newParticles = [];

        for (let i = 0; i < 100; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: -20 - Math.random() * 80,
                size: 5 + Math.random() * 15,
                color: ['#f759ab', '#722ed1', '#2f54eb', '#faad14', '#52c41a', '#ff4d4f', '#13c2c2'][
                    Math.floor(Math.random() * 7)
                ],
                speed: 2 + Math.random() * 4,
                rotation: Math.random() * 360,
                shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
                opacity: 1,
            });
        }
        setParticles(newParticles);
        message.success({
            content: '成功加入渠道!',
            icon: <FireOutlined style={{ color: '#722ed1' }} />,
            duration: 3,
        });


        setTimeout(() => {
            setShowEasterEgg(false);
            setParticles([]);
            navigate('/');
        }, 5000);
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(inviteCode).then(
            () => {
                message.info('已复制邀请码');
            },
            () => {
                message.error('复制失败，请手动复制');
            }
        );
    };

    useEffect(() => {
        if (particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    y: p.y + p.speed,
                    rotation: p.rotation + 5,
                    opacity: p.opacity - 0.01,
                })).filter(p => p.y < 120 && p.opacity > 0)
            );
        }, 30);

        return () => clearInterval(interval);
    }, [particles]);

    return (
        <div style={{
            background: '#f0f2f5',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{ position: 'relative', maxWidth: '480px', width: '100%' }}>
                <Card
                    bordered={false}
                    style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden'
                    }}
                    cover={
                        <div style={{
                            height: '120px',
                            background: 'linear-gradient(to right, #722ed1, #1890ff)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Title level={2} style={{ color: 'white', margin: 0 }}>专属邀请函</Title>
                        </div>
                    }
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Paragraph type="secondary">您收到了一份特别邀请</Paragraph>

                            <div style={{ margin: '16px 0' }}>
                                <Input.Group compact>
                                    <Input
                                        style={{ width: 'calc(100% - 32px)' }}
                                        value={inviteCode}
                                        readOnly
                                    />
                                    <Button icon={<CopyOutlined />} onClick={copyInviteCode} />
                                </Input.Group>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    邀请码将在加入后自动使用
                                </Text>
                            </div>
                        </div>

                        <Divider style={{ margin: '8px 0' }} />

                        <div style={{ textAlign: 'center' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<UserAddOutlined />}
                                onClick={handleJoinClick}
                                style={{
                                    background: 'linear-gradient(to right, #722ed1, #1890ff)',
                                    borderColor: '#722ed1',
                                    height: '48px',
                                    paddingLeft: '24px',
                                    paddingRight: '24px',
                                    fontSize: '16px'
                                }}
                            >
                                加入渠道
                            </Button>
                        </div>
                    </Space>
                </Card>

                {showEasterEgg && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 10
                    }}>
                        <div style={{
                            animation: 'antd-bounce 1s infinite',
                            marginBottom: '16px',
                            fontSize: '48px',
                            color: '#faad14'
                        }}>
                            <CheckOutlined />
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}>
                            <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>
                                欢迎加入! 🎉
                            </Text>
                        </div>
                    </div>
                )}

                {particles.map(particle => (
                    <div
                        key={particle.id}
                        style={{
                            position: 'absolute',
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            opacity: particle.opacity,
                            transform: `rotate(${particle.rotation}deg)`,
                            borderRadius: particle.shape === 'circle' ? '50%' :
                                particle.shape === 'square' ? '0' : '50% 50% 0 50%',
                            clipPath: particle.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                        }}
                    />
                ))}
            </div>

        </div>
    );
}