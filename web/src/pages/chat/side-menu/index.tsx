
import { Flexbox } from "react-layout-kit";
import { useChatStore } from "../../../store/chat";
import { Button, Divider, Input } from "antd";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Session from "./session";

export default function SideMenu() {
    const [expanded, setExpanded] = useChatStore(state => [state.sideBarExpanded, state.setSideBarExpanded]);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    }

    return (<>
        <Flexbox style={{
            width: expanded ? 200 : 50,
            transition: 'width 0.3s',
            padding: 5,
        }}>
            <Flexbox horizontal style={{
                width: '100%',
                justifyContent: 'flex-end'
            }}>
                <Flexbox style={{
                    marginRight: 5,
                    width: expanded ? 140 : 0,
                }}>
                    {expanded &&
                        <Input.Search
                            style={{
                                width: 140,
                            }}
                            placeholder="搜索"
                        />}
                </Flexbox>
                <Button
                    style={{
                        width: 50,
                        height: 30,
                        display: 'flex',
                        justifyContent: 'flex-end',

                    }}
                    onClick={toggleExpanded}
                >
                    {
                        expanded ? <PanelLeftClose /> : <PanelLeftOpen />
                    }
                </Button>
            </Flexbox>
            {
                expanded && <Session />
            }
        </Flexbox>
        <Divider type="vertical" style={{
            height: '100%',
            margin: 0,
        }} />
    </>)
}