import { Flexbox } from "react-layout-kit";
import ChannelList, { ChannelItem } from "./ChannelList";
import { useEffect, useState } from "react";
import { getChannelDetail, getChannelList, testChannel } from "@/apis/ModelaChannel";
import { Tabs, message } from "antd";
import ChannelMember from "./ChannelMember";
import ChannelConfig from "./ChannelConfig";
import ChannelInviteCode from "./ChannelInviteCode";
import "./index.css";
import ChannelKey from "./ChannelKey";
import { useUser } from "@/hooks/useUser";

export default function ConsoleChannel() {
    const [channel, setChannel] = useState<ChannelItem | null>(null);

    const [loading, setLoading] = useState(true);
    const [channelList, setChannelList] = useState<ChannelItem[]>([]);
    const user = useUser();
    useEffect(() => {
        fetchChannelList();
    }, []);

    const onChannelChange = async (id: number) => {
        try {
            const response = await getChannelDetail(id);
            setChannel(response.data);
        } catch (error) {
            console.error("获取渠道详情失败:", error);
            message.error("获取渠道详情失败");
        }
    }

    const fetchChannelList = async () => {
        try {
            setLoading(true);
            const response = await getChannelList();
            setChannelList(response.data);
            if (response.data.length > 0) {
                onChannelChange(response.data[0].id);
            }
        } catch (error) {
            console.error("获取渠道列表失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const onDeleteChannel = (id: number) => {
        setChannelList(channelList.filter(x => x.id !== id));
        if (channel?.id === id && channelList.length > 0) {
            onChannelChange(channelList[0].id);
        } else {
            setChannel(null);
        }
    }

    const onTestChannel = async (id: number) => {
        const res = await testChannel(id);
        if (res.success) {
            message.success('测试成功');
            fetchChannelList();
        } else {
            message.error(res.message);
        }
    }

    return (
        <Flexbox className="channel-tabs" horizontal gap={16}>
            <ChannelList
                channelList={channelList}
                loading={loading}
                channel={channel}
                onDeleteChannel={onDeleteChannel}
                onChannelChange={onChannelChange}
                onChannelListChange={setChannelList}
                onChannelCreateSuccess={fetchChannelList}
                onTestChannel={onTestChannel}
            />
            {channel && (
                <Tabs
                    style={{
                        flex: 1,
                        marginRight: '16px',
                               height: '100%',
                        overflow: 'auto',
                    }}
                    defaultActiveKey="channelConfig" >
                    <Tabs.TabPane tab="渠道配置" key="channelConfig">
                        <ChannelConfig channel={channel} />
                    </Tabs.TabPane>
                    {channel?.createdBy === user?.id && (
                        <>
                            <Tabs.TabPane tab="渠道成员" key="channelMember">
                                <ChannelMember
                                    onUpdateChannel={fetchChannelList}
                                    channel={channel} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="渠道邀请码" key="channelInviteCode">
                                <ChannelInviteCode channel={channel} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="渠道密钥管理" key="channelKey">
                                <ChannelKey channel={channel} />
                            </Tabs.TabPane>
                        </>
                    )}
                </Tabs>
            )}
        </Flexbox>
    )
}