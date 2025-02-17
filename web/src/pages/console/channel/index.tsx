import { Flexbox } from "react-layout-kit";
import ChannelList from "./ChannelList";


export default function ConsoleChannel() {
    return (
        <Flexbox style={{
            width:'100%',
            height:'100%',
            overflow:'auto'
        }}>
            <ChannelList />
        </Flexbox>
    )
}