import { Flexbox } from "react-layout-kit";
import { Button, Table, Typography, Tag } from "antd";
import { useState } from "react";

export default function ChannelInviteCode() {
    const [dataSource, setDataSource] = useState<any[]>([]);

    const columns = [
        {
            title: '邀请码',
            dataIndex: 'code',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
        },
        {
            title: '状态',
            dataIndex: 'status',
        },
        {
            title: '过期时间',
            dataIndex: 'expireTime',
        },
        {
            title: '是否已使用',
            dataIndex: 'isUsed',
            render: (text: boolean) => text ? '是' : '否',
        },
        {
            title: '使用人数',
            dataIndex: 'usedCount',
        },
        {
            title: '最大使用人数',
            dataIndex: 'maxUseCount',
        },
        {
            title: '是否启用',
            dataIndex: 'enabled',
            render: (text: boolean) => text ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
        },
    ];

    return (
        <Flexbox>
            <Flexbox
                horizontal
                style={{
                    width: '100%',
                    justifyContent: 'space-between',
                }}
                gap={16}
            >
                <Typography.Text
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                    }}
                >
                    渠道用户邀请码
                </Typography.Text>
                <Button>生成邀请码</Button>
            </Flexbox>
            <Flexbox
                style={{
                    marginTop: 16,
                    borderRadius: 8,
                    padding: 16,
                }}
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="code"
                />
            </Flexbox>
        </Flexbox>
    );
}


