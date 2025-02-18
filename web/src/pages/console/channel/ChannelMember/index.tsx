import { Avatar, Button, Typography } from "antd";
import { ChannelItem } from "../ChannelList";
import { Flexbox } from "react-layout-kit";
import { PlusOutlined } from "@ant-design/icons";

interface ChannelMemberProps {
    channel: ChannelItem | null;
}



export default function ChannelMember({ channel }: ChannelMemberProps) {

    return <Flexbox
        style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
        }}
        gap={16}
    >
        <Flexbox style={{
            height: '40px',
            width: '100%',
            justifyContent: 'space-between',
        }} horizontal gap={5}>
            <Typography.Text>
                成员列表
            </Typography.Text>
            <Button type="primary" icon={<PlusOutlined />} />

        </Flexbox>
        {
            channel?.shareUsers?.map(({ user }) => (
                <Flexbox
                    horizontal
                    key={user.id}
                    gap={8}
                >
                    <Avatar src={user.avatar} />
                    <Typography.Text>{user.displayName}</Typography.Text>
                </Flexbox>
            ))
        }
        {
            channel?.shareUsers?.length === 0 && (
                <Typography.Text style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: '16px',
                }}>暂无成员</Typography.Text>
            )
        }
    </Flexbox>
}
