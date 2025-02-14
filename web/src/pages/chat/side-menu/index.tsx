
import { Flexbox } from "react-layout-kit";
import { useChatStore } from "../../../store/chat";
import { Button, Divider, Input } from "antd";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Session from "./session";
import { useEffect } from "react";
import { getSessionLite } from "../../../apis/Session";
import UserInfo from "./user-info";

export default function SideMenu() {
    const [expanded, setExpanded, search, setSessions, setSearch] =
        useChatStore(state => [state.sideBarExpanded, state.setSideBarExpanded, state.searchSessionValue, state.setSessions, state.setSearchSessionValue]);

    useEffect(() => {
        onSearch(search);
    }, [search])

    const onSearch = (value?: string) => {
        getSessionLite(value).then(result => {
            setSessions(result.data);
        });
    }

    const toggleExpanded = () => {
        setExpanded(!expanded);
    }

    return (<>
        <Flexbox style={{
            width: expanded ? 240 : 50,
            transition: 'width 0.3s',
            padding: 5,
        }}>
            <Flexbox horizontal style={{
                width: '100%',
                justifyContent: 'flex-end'
            }}>
                <Flexbox style={{
                    marginRight: 5,
                }}>
                    {expanded &&
                        <Input.Search
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: 180,
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
            <Session />
            <UserInfo/>
        </Flexbox>
        <Divider type="vertical" style={{
            height: '100%',
            margin: 0,
        }} />
    </>)
}