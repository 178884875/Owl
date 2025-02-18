import { useEffect, useState } from "react";
import { Flexbox } from "react-layout-kit";
import { List, Card, Tag, Typography, Button, Dropdown, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { deleteChannel, getChannelList } from "@/apis/ModelaChannel";
import { theme } from "antd";
import CreateChannel from "../CreateChannel";
import { getIconByName } from "@/utils/iconutil";

const { useToken } = theme;

// 定义 ChannelItem 接口
export interface ChannelItem {
    id: number;
    provider: string;
    endpoint: string;
    modelIds: string[];
    name: string;
    description?: string;
    avatar?: string;
    tags: string[];
    favorite: boolean;
    enabled: boolean;
    responseTime?: number;
    tokenCost?: number;
    requestCount?: number;
    createdBy?: string;
    shareUsers?: any[]
}

interface ChannelListProps {
    channel: ChannelItem | null;
    onChannelChange: (id: number) => void;
    onChannelListChange: (channelList: ChannelItem[]) => void;
    onChannelCreateSuccess: () => void;
    channelList: ChannelItem[];
    loading: boolean;
}

export default function ChannelList({ channel, onChannelChange, onChannelListChange, onChannelCreateSuccess, channelList, loading }: ChannelListProps) {
    const { token } = useToken();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const handleAddChannel = () => {
        setIsCreateModalVisible(true);
    };


    return (
        <Flexbox
            style={{
                width: '250px',
                height: '100%',
                overflow: 'auto',
                borderRadius: '8px',
                overflowX: 'hidden',
                backgroundColor: token.colorBgElevated
            }}
            gap={16}
        >
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddChannel}
                style={{ margin: '16px 16px 0' }}
            >
                添加渠道
            </Button>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={channelList}
                loading={loading}
                style={{
                    padding: '5px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    height: 'calc(100vh - 150px)',
                }}
                locale={{
                    emptyText: <Flexbox style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span>
                            暂无渠道数据，您可以点击添加渠道按钮创建新的渠道
                        </span>
                    </Flexbox>
                }}
                renderItem={(item) => (
                    <Dropdown
                        trigger={['contextMenu']}
                        menu={{
                            items: [
                                {
                                    label: '删除',
                                    style: {
                                        color: 'red',
                                    },
                                    key: 'delete',
                                    onClick: async () => {
                                        await deleteChannel(item.id);
                                        message.success('删除成功');
                                    },
                                },
                            ]
                        }}>
                        <List.Item>
                            <Card
                                onClick={() => onChannelChange(item.id)}
                                size="small"
                                bodyStyle={{
                                    padding: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    backgroundColor: channel?.id === item.id ? token.colorPrimaryBorderHover : token.colorBgElevated,
                                    transition: 'background-color 0.5s ease',
                                }}
                            >
                                <Flexbox gap={8}>
                                    <Flexbox horizontal justify="space-between" align="center">
                                        {getIconByName(item.provider)}
                                        <Typography.Text style={{
                                            flex: 1,
                                        }} strong>{item.name}</Typography.Text>
                                        <Flexbox horizontal>
                                            <Tag style={{
                                                fontSize: '10px',
                                            }} color={item.enabled ? "green" : "red"}>{item.enabled ? "启用" : "禁用"}</Tag>
                                        </Flexbox>
                                    </Flexbox>
                                    <div>
                                        {item.tags.map((tag) => (
                                            <Tag key={tag}>{tag}</Tag>
                                        ))}
                                    </div>
                                </Flexbox>
                            </Card>
                        </List.Item>
                    </Dropdown>
                )}
            />
            <CreateChannel
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    onChannelCreateSuccess();
                    setIsCreateModalVisible(false);
                }}
            />
        </Flexbox>
    );
}
