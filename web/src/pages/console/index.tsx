import { Avatar, Divider, Menu } from "antd";
import { ChartArea, Webhook } from "lucide-react";
import { Flexbox } from "react-layout-kit";
import { Outlet } from "react-router-dom";
import UserInfo from "../main/side-menu/user-info";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "antd";
import { User, Settings } from "lucide-react";
import { useUser } from "@/hooks/useUser";

const { useToken } = theme;

export default function ConsoleLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useToken();
    const user = useUser();
    const [menus, setMenus] = useState<any[]>([]);
    const [key, setKey] = useState('/console');

    useEffect(() => {
        setKey(location.pathname);
    }, [location.pathname])

    useEffect(() => {
        if (user?.role?.toLowerCase() === 'admin') {
            setMenus([

                {
                    icon: <ChartArea />,
                    label: '控制台',
                    key: '/console',
                },
                {
                    icon: <Webhook />,
                    label: '模型服务',
                    key: '/console/channel',
                },
                {
                    icon: <Settings />,
                    label: '模型管理',
                    key: '/console/model',
                },
                {
                    icon: <User />,
                    label: '用户管理',
                    key: '/console/user',
                }
            ])
        } else {
            setMenus([
                {
                    icon: <ChartArea />,
                    label: '控制台',
                    key: '/console',
                },
                {
                    icon: <Webhook />,
                    label: '模型服务',
                    key: '/console/channel',
                }
            ])
        }
    }, [user])


    return (<Flexbox
        horizontal
        style={{
            height: '100vh',
            width: '100%',
        }}
    >
        <Flexbox style={{
            width: 220,
            minWidth: 220,
            height: 'auto',
            backgroundColor: token.colorBgContainer,
            padding: 10,
        }}>
            <Flexbox style={{
                height: 40,
                width: '100%',
                justifyContent: 'center',
                marginTop: 20,
                marginBottom: 40,
                alignItems: 'center',
                fontSize: 18,
                userSelect: 'none',
                fontWeight: 600,
                cursor: 'pointer',
            }}
                onClick={() => {
                    navigate('/console')
                }}
                horizontal
            >
                <Avatar
                    size={32}
                    src="/logo.png"
                />
                <span>
                    Owl
                </span>
            </Flexbox>
            <Menu
                style={{
                    height: '100%',
                    // 取消右边颜色
                    borderRight: 'none',
                }}
                onClick={(info) => {
                    navigate(info.key)
                }}
                selectedKeys={[key]}
                items={menus}
            />
            <UserInfo />
        </Flexbox>
        <Flexbox style={{
            flex: 1,
            backgroundColor: token.colorBgContainerDisabled
        }}>
            <Flexbox style={{
                height: 40,
                minHeight: 40,
                width: '100%',
                // 居中
                justifyContent: 'center',
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 8,
                marginRight: 5,
            }}>
                <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                }}>
                    Owl，给您带来愉快的编码体验！
                </span>
            </Flexbox>
            <Divider style={{
                margin: 0
            }} />
            <Flexbox style={{
                flex: 1,
                width: '100%',
                padding: 10,
            }}>
                <Outlet />
            </Flexbox>
        </Flexbox>
    </Flexbox>)
}