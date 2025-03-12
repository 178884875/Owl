import { Flexbox } from "react-layout-kit";
import SessionConfigPage from "../features/session-config";
import ChatList from "./ChatList";
import ChatInput from "./ChatInput";



export default function Workspace() {


    return (<Flexbox
        style={{
            flex: 1,
            width: '100%',
            height: 'calc(100% - 55px)',

        }}
        horizontal
    >
        <Flexbox style={{
            height: '100%',
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <ChatList />
            <ChatInput />
        </Flexbox>
        <SessionConfigPage />
    </Flexbox>)
}