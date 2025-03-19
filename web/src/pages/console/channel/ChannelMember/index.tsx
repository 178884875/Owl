import { Avatar, Typography, Divider, Table, Tag, Button, Dropdown, Menu, message, Pagination } from "antd";
import { ChannelItem } from "../ChannelList";
import { Flexbox } from "react-layout-kit";
import { UserOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { enableShareUser, getShareList, deleteChannelShare } from "@/apis/ModelaChannel";
import { useState, useEffect } from "react";
import { renderQuota } from "@/utils/render";

interface ChannelMemberProps {
    channel: ChannelItem | null;
    // 通知更新渠道
    onUpdateChannel: () => void;
}

export default function ChannelMember({ channel, onUpdateChannel }: ChannelMemberProps) {
    const [memberList, setMemberList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchMemberList = async () => {
        if (!channel?.id) return;
        
        setLoading(true);
        try {
            const result = await getShareList(channel.id);
            if (result.success) {
                const data = result.data.map(({ user, requestCount, tokenCount, enabled, id,quota }: any) => ({
                    key: user.id,
                    id,
                    quota,
                    avatar: user.avatar,
                    displayName: user.displayName,
                    email: user.email,
                    phone: user.phone,
                    requestCount,
                    tokenCount,
                    enabled,
                }));
                setMemberList(data);
                setPagination({
                    ...pagination,
                    total: data.length
                });
            } else {
                message.error("获取成员列表失败");
            }
        } catch (error) {
            console.error("获取成员列表出错:", error);
            message.error("获取成员列表出错");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemberList();
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
            title: '剩余配额',
            dataIndex: 'quota',
            key: 'quota',
            render: (quota: number) => {
                return renderQuota(quota);
            },
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
            render: (_: string, record: any) => (
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
            fetchMemberList();
            onUpdateChannel();
        } else {
            message.error("操作失败");
        }
    };

    const handleDelete = async (record: any) => {
        try {
            const result = await deleteChannelShare(record.id);
            if (result.success) {
                message.success("删除成员成功");
                fetchMemberList();
                onUpdateChannel();
            } else {
                message.error("删除成员失败");
            }
        } catch (error) {
            console.error("删除成员出错:", error);
            message.error("删除成员出错");
        }
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination({
            ...pagination,
            current: page,
            pageSize: pageSize || pagination.pageSize
        });
    };

    // 分页后的数据
    const paginatedData = memberList.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

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
                <Button 
                    type="primary" 
                    icon={<ReloadOutlined />} 
                    onClick={fetchMemberList}
                >
                    刷新
                </Button>
            </Flexbox>
            <Divider />
            <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                loading={loading}
                locale={{
                    emptyText: <Typography.Text style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: '16px',
                    }}>暂无成员</Typography.Text>
                }}
            />
            <Flexbox horizontal style={{ justifyContent: 'flex-end', padding: '16px' }}>
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条记录`}
                />
            </Flexbox>
        </Flexbox>
    );
}
