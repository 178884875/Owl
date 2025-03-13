import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/user/store";
import { Avatar, Divider, Dropdown, theme } from "antd";
import {
    ChartArea, MessageSquareText, LogOut as LogOutIcon, User, Webhook,
    Newspaper,
    CircleHelp, KeyRound,
    Github
} from "lucide-react";
import React, { useState } from "react";
import { Flexbox } from "react-layout-kit";
import { useNavigate } from "react-router-dom";
import { ChangePasswordModal } from "./change-password";
import { GITHUB_URL } from "@/consts/app";

const { useToken } = theme;

export interface UserMenuProps {
    children: React.ReactNode;
}

export function UserMenu({
    children
}: UserMenuProps) {
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const user = useUser()

    const [LogOut] = useUserStore(state => [state.LogOut])
    const navigate = useNavigate()
    const { token } = useToken();
    const contentStyle: React.CSSProperties = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
    };

    const menuStyle: React.CSSProperties = {
        boxShadow: 'none',
    };
    return (
        <>
            <Dropdown
                trigger={['click']}
                placement="top"
                dropdownRender={(menu) => (
                    <div style={contentStyle}>
                        <Flexbox style={{
                            padding: 10,
                        }}
                            horizontal
                        >
                            <Avatar
                                size={36}
                                style={{
                                    cursor: 'pointer',
                                    marginTop: 5,
                                }}
                                src={user?.avatar}
                            />
                            <Flexbox style={{
                                marginLeft: 10,
                                flex: 1,
                                userSelect: 'none',
                            }}>
                                <div style={{
                                    fontSize: 16,
                                    fontWeight: 500,
                                }}>
                                    {user?.userName}
                                </div>
                                <div style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: 14,
                                }}>
                                    {user?.email}
                                </div>
                            </Flexbox>
                        </Flexbox>
                        <Divider style={{ margin: 0 }} />
                        {React.cloneElement(
                            menu as React.ReactElement<{
                                style: React.CSSProperties;
                            }>,
                            { style: menuStyle },
                        )}
                    </div>
                )}
                menu={{
                    items: [
                        {
                            key: 'profile',
                            label: '个人信息',
                            icon: <User
                                size={18}
                            />,
                            onClick: () => {
                                navigate('/profile')
                            }
                        },
                        {
                            key: 'changePassword',
                            label: '修改密码',
                            icon: <KeyRound size={18} />,
                            onClick: () => {
                                setChangePasswordOpen(true);
                            }
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: 'github',
                            label: '关注我们',
                            icon: <Github size={18} />,
                            onClick: () => {
                                window.open(GITHUB_URL, '_blank')
                            }
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: "LearnMore",
                            label: "了解更多",
                            children: [
                                {
                                    key: 'about',
                                    icon: <Newspaper size={18} />,
                                    label: '关于Thor Chat',
                                    onClick: () => {
                                        navigate('/about')
                                    }
                                },
                                {
                                    type: 'divider',
                                },
                                {
                                    key: 'help',
                                    icon:<CircleHelp size={18} />,
                                    label: '帮助和反馈',
                                    onClick: () => {
                                        navigate('/help')
                                    }
                                }
                            ]
                        },
                        {
                            key: 'chat',
                            label: '对话',
                            icon: <MessageSquareText size={18} />,
                            onClick: () => {
                                navigate('/')
                            }
                        },
                        {
                            key: 'console',
                            icon: <ChartArea size={18} />,
                            label: '控制台',
                            onClick: () => {
                                navigate('/console')
                            }
                        },
                        {
                            key: 'channel',
                            icon: <Webhook size={18} />,
                            label: '渠道管理',
                            onClick: () => {
                                navigate('/console/channel')
                            }
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: 'logout',
                            icon: <LogOutIcon size={18} />,
                            label: '退出登录',
                            onClick: () => {
                                LogOut()
                                navigate('/auth/login')
                            }
                        }
                    ]
                }}
            >
                {children}
            </Dropdown>

            <ChangePasswordModal 
                open={changePasswordOpen} 
                onClose={() => setChangePasswordOpen(false)} 
            />
        </>
    );
}