
import { Flexbox } from "react-layout-kit";
import SessionConfig from "../features/session-config";
import ChatList from "./ChatList";
import ChatInput from "./ChatInput";



export default function Workspace() {


    return (<Flexbox
        style={{
            flex: 1,
        }}
        horizontal
    >
        <Flexbox style={{
            flex: 1,
            height: '100%',
        }}>
            <ChatList />
            <ChatInput />
        </Flexbox>
        <SessionConfig />
    </Flexbox>)
}