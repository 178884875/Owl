import { Avatar, Typography, Divider, Table, Tag } from "antd";
import { ChannelItem } from "../ChannelList";
import { Flexbox } from "react-layout-kit";
import { UserOutlined } from "@ant-design/icons";

interface ChannelMemberProps {
    channel: ChannelItem | null;
}

export default function ChannelMember({ channel }: ChannelMemberProps) {
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
    ];

    const dataSource = channel?.shareUsers?.map(({ user }) => ({
        key: user.id,
        avatar: user.avatar,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
    })) || [];

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
