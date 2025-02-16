import { useChatStore } from "@/store/chat";
import { chatSelectors } from "@/store/chat/selectors";
import { Flexbox } from "react-layout-kit";
import {
    theme
} from "antd";

const {
    useToken
} = theme;

export default function DefaultSession() {
    const { token } = useToken();

    const [
        isCurrentSession,
        selectSession,
        sideBarExpanded
    ] = useChatStore(state => [chatSelectors.isCurrentSession(state, -1), state.selectSession, state.sideBarExpanded]);

    return (
        <>
            {sideBarExpanded && (<Flexbox
                style={{
                    padding: 5,
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 16,
                    color: token.colorTextDescription,
                    userSelect: 'none',
                }}
                >
                暂无会话
            </Flexbox>)}
        </>
    )
}