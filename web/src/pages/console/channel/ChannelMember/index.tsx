import { Avatar, Typography, Divider, Table, Tag, Button, Dropdown, Menu, message } from "antd";
import { ChannelItem } from "../ChannelList";
import { Flexbox } from "react-layout-kit";
import { UserOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
 } from "@ant-design/icons";
import { enableShareUser } from "@/apis/ModelaChannel";
import { useState, useEffect } from "react";

interface ChannelMemberProps {
    channel: ChannelItem | null;
    // 通知更新渠道
    onUpdateChannel: () => void;
}

export default function ChannelMember({ channel, onUpdateChannel }: ChannelMemberProps) {
    const [memberList, setMemberList] = useState<any[]>([]);
    const [refreshFlag, setRefreshFlag] = useState(0);

    useEffect(() => {
        if (channel?.shareUsers) {
            const data = channel.shareUsers.map(({ user, requestCount, tokenCount, enabled, id }) => ({
                key: user.id,
                id,
                avatar: user.avatar,
                displayName: user.displayName,
                email: user.email,
                phone: user.phone,
                requestCount,
                tokenCount,
                enabled,
            }));
            setMemberList(data);
        }
    }, [channel]);

    const columns = [
        {
            title: '头像',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar: string) => <Avatar src={avatar} icon={<UserOutlined />} />,
        },
        {
            title: '姓名',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '电话',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '请求次数',
            dataIndex: 'requestCount',
            key: 'requestCount',
        },
        {
            title: '消费token',
            dataIndex: 'tokenCount',
            key: 'tokenCount',
        },
        {
            title: '是否启用',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => enabled ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
        },
        {
            title: '操作',
            key: 'action',
            render: (text: string, record: any) => (
                <Flexbox horizontal gap={5}>
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEnabled(record)}>
                                {record.enabled ? "禁用" : "启用"}
                            </Menu.Item>
                            <Menu.Item 
                                danger
                                key="delete" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                                删除
                            </Menu.Item>
                        </Menu>
                    } trigger={['click']}>
                        <Button type="text">
                            <MoreOutlined />
                        </Button>
                    </Dropdown>
                </Flexbox>
            ),
        }
    ];

    const handleEnabled = async (record: any) => {
        const result = await enableShareUser(record.id);

        if(result.success) {
            message.success("操作成功");
            onUpdateChannel();
        } else {
            message.error("操作失败");
        }
    };

    const handleDelete = (record: any) => {
        console.log(record);
    };

    const dataSource = memberList;

    return (
        <Flexbox
            style={{
                height: '100%',
                overflow: 'auto',
            }}
            gap={16}
        >
            <Flexbox style={{
                padding: '0 10px',
                justifyContent: 'space-between',
            }} horizontal gap={5}>
                <Typography.Title level={4}>
                    成员列表
                </Typography.Title>
            </Flexbox>
            <Divider />
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                locale={{
                    emptyText: <Typography.Text style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: '16px',
                    }}>暂无成员</Typography.Text>
                }}
            />
        </Flexbox>
    );
}
