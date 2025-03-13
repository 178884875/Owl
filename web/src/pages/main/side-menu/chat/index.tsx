import { Flexbox } from "react-layout-kit";
import { message, theme } from "antd";

export default function Chat() {

    const { token } = theme.useToken();

    return (<Flexbox
        onClick={() => {
            message.info('暂未开放')
        }}
        style={{
            width: '100%',
            backgroundColor: token.colorFillSecondary,
            borderRadius: 8,
            cursor: 'pointer',
            marginBottom: 5,
        }}
    >
        {/* <Flexbox
            horizontal
            style={{
                padding: 5,
                width: 'auto',
                justifyContent: 'space-between',
            }}
        >
            <MessageSquareText
                size={24}
                style={{
                    color: token.colorTextTertiary,
                    marginLeft: 8,
                }}
            />

            {
                expanded && (
                    <span
                        style={{
                            fontSize: 16,
                            cursor: 'pointer',
                            color: token.colorTextTertiary,
                        }}>
                        与好友聊天
                    </span>)
            }
        </Flexbox> */}
    </Flexbox>)
}
