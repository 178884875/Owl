import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/user/store";
import { Avatar,  Divider, Dropdown, theme } from "antd";
import React from "react";
import { Flexbox } from "react-layout-kit";
import { useNavigate } from "react-router-dom";

const { useToken } = theme;

export interface UserMenuProps {
    children: React.ReactNode;
}

export function UserMenu({
    children
}: UserMenuProps) {

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
                        onClick: () => {
                            navigate('/profile')
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
                                label: '帮助和反馈',
                                onClick: () => {
                                    navigate('/help')
                                }
                            }
                        ]
                    },
                    {
                        key: 'console',
                        label: '控制台',
                        onClick: () => {
                            navigate('/console')
                        }
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'logout',
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
    );
}