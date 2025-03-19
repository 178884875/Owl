import { useState, useMemo } from "react";
import { Flexbox } from "react-layout-kit";
import { List, Card, Tag, Typography, Button, Dropdown, message, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { deleteChannel, enableChannel } from "@/apis/ModelaChannel";
import { theme } from "antd";
import CreateChannel from "../CreateChannel";
import { getIconByName, getProvider } from "@/utils/iconutil";
import { useChatStore } from "@/store/chat/store";
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
    shareUsers?: any[];
    keys?: any[];
    available: boolean;
    isShare: boolean;
    shareRequestCount?: number;
    shareTokenCost?: number;
    shareQuota?: number;
}

interface ChannelListProps {
    channel: ChannelItem | null;
    onChannelChange: (id: number) => void;
    onChannelListChange: (channelList: ChannelItem[]) => void;
    onChannelCreateSuccess: () => void;
    channelList: ChannelItem[];
    loading: boolean;
    onDeleteChannel: (id: number) => void;
    onTestChannel: (id: number) => Promise<void>;
}

// @ts-ignore
export default function ChannelList({ channel, onChannelChange, onChannelListChange, onChannelCreateSuccess, channelList, loading, onDeleteChannel, onTestChannel }: ChannelListProps) {
    const { token } = useToken();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const [clearCacheAndReloadModels] = useChatStore((state) => [state.clearCacheAndReloadModels]);

    const handleAddChannel = () => {
        setIsCreateModalVisible(true);
    };

    // 将channelList分为普通列表和共享列表
    const { normalChannels, sharedChannels } = useMemo(() => {
        return channelList.reduce((acc: any, item: any) => {
            if (item.isShare) {
                acc.sharedChannels.push(item);
            } else {
                acc.normalChannels.push(item);
            }
            return acc;
        }, { normalChannels: [], sharedChannels: [] });
    }, [channelList]);

    const renderChannelList = (channels: ChannelItem[], isShared = false) => (
        <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={channels}
            loading={loading}
            style={{
                padding: '5px',
            }}
            locale={{
                emptyText: isShared ? <span>暂无共享模型服务</span> : (
                    <Flexbox style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span>
                            暂无模型服务数据
                        </span>
                    </Flexbox>
                )
            }}
            renderItem={(item: ChannelItem) => (
                <Dropdown
                    trigger={['contextMenu']}
                    menu={{
                        items: item.isShare ? [] : [
                            {
                                label: '测试渠道',
                                key: 'test',
                                onClick: async () => {
                                    await onTestChannel(item.id);
                                },
                            },
                            {
                                label: item.enabled ? '禁用渠道' : '启用渠道',
                                key: 'enable',
                                disabled: item.isShare,
                                onClick: async () => {
                                    await enableChannel(item.id);
                                    message.success(item.enabled ? '禁用成功' : '启用成功');
                                    onChannelCreateSuccess();
                                },
                            },
                            {
                                label: '删除',
                                style: {
                                    color: 'red',
                                },
                                key: 'delete',
                                onClick: async () => {
                                    await deleteChannel(item.id);
                                    onDeleteChannel(item.id);
                                    message.success('删除成功');
                                },
                            },
                        ]
                    }}>
                    <List.Item style={{
                        width: '100%',
                        padding: '0',
                    }}>
                        <Card
                            onClick={() => {
                                if (item.id !== channel?.id) {
                                    onChannelChange(item.id);
                                }
                            }}
                            size="small"
                            bodyStyle={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                backgroundColor: channel?.id === item.id ? token.colorPrimaryBorderHover : token.colorBgElevated,
                                transition: 'background-color 0.3s ease',
                            }}
                        >
                            <Flexbox gap={2}>
                                <Flexbox horizontal justify="space-between" align="center">
                                    {getIconByName(item.provider)}
                                    <Typography.Text style={{
                                        flex: 1,
                                    }} strong>{getProvider(item.provider)}</Typography.Text>
                                    <Flexbox gap={2}>
                                        {!item.isShare && (
                                            <>
                                                {item.enabled && (
                                                    <Tag color="green" style={{
                                                        color: token.colorPrimary,
                                                        backgroundColor: token.colorPrimaryBg,
                                                        fontSize: '10px',
                                                    }}>
                                                        On
                                                    </Tag>
                                                )}
                                                {
                                                    item.available && (
                                                        <Tag 
                                                        color='green'
                                                        style={{
                                                            fontSize: '10px',
                                                        }}>
                                                            Good
                                                        </Tag>
                                                    )
                                                }
                                            </>
                                        )}
                                    </Flexbox>
                                </Flexbox>
                            </Flexbox>
                        </Card>
                    </List.Item>
                </Dropdown>
            )}
        />
    );

    return (
        <Flexbox
            style={{
                width: '250px',
                height: '100%',
                borderRadius: '8px',
                backgroundColor: token.colorBgElevated,
                display: 'flex',
                flexDirection: 'column',
            }}
            gap={16}
        >
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddChannel}
                style={{ margin: '16px 16px 0' }}
            >
                添加模型服务
            </Button>

            <Flexbox style={{ 
                overflowY: 'auto', 
                overflowX: 'hidden',
                paddingBottom: '16px', 
                height: 'calc(100vh - 160px)',
            }}>
                {renderChannelList(normalChannels)}

                {sharedChannels.length > 0 && (
                    <>
                        <Divider style={{ margin: '16px 0 8px' }}>共享模型服务</Divider>
                        {renderChannelList(sharedChannels, true)}
                    </>
                )}
            </Flexbox>

            <CreateChannel
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    onChannelCreateSuccess();
                    setIsCreateModalVisible(false);
                    clearCacheAndReloadModels();
                }}
            />
        </Flexbox>
    );
}
