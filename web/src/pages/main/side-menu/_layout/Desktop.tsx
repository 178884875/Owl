import { Flexbox } from "react-layout-kit";
import { useChatStore } from "@/store/chat";
import { Button, Divider, Input, Tooltip } from "antd";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Session from "../session";
import { useEffect, useCallback } from "react";
import UserInfo from "../user-info";
import CreateSession from "../create-session";

const styles = {
    container: {
        transition: 'width 0.3s ease',
        padding: 5,
    },
    header: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchWrapper: {
        opacity: 1,
        transition: 'opacity 0.3s ease, width 0.3s ease',
        marginRight: 8,
    },
    searchCollapsed: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
        margin: 0,
    },
    toggleButton: {
        width: 48,
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: 'none',

    },
    divider: {
        height: '100%',
        margin: 0,
    }
};

export default function SideMenu() {
    const [expanded, setExpanded, search, setSearch, loadSessions] =
        useChatStore(state => [state.sideBarExpanded, state.setSideBarExpanded, state.searchSessionValue, state.setSearchSessionValue, state.loadSessions]);

    const onSearch = useCallback((value?: string) => {
        loadSessions(value || '');
    }, [loadSessions]);

    useEffect(() => {
        onSearch(search);
    }, [search, onSearch]);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    }

    return (<>
        <Flexbox style={{
            ...styles.container,
            width: expanded ? 220 : 50,
            maxWidth: 220,
        }}>
            <Flexbox horizontal style={styles.header}>
                <Flexbox style={{
                    ...styles.searchWrapper,
                    ...(expanded ? {} : styles.searchCollapsed)
                }}>
                    <Input.Search
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: expanded ? 180 : 0 }}
                        placeholder="搜索"
                    />
                </Flexbox>
                <Tooltip title={expanded ? "收起菜单" : "展开菜单"} placement="right">
                    <Button
                        style={styles.toggleButton}
                        onClick={toggleExpanded}
                        type="text"
                        icon={expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                    />
                </Tooltip>
            </Flexbox>
            <Session />
            <Flexbox flex={1} />
            <UserInfo />
            <CreateSession />
        </Flexbox>
        <Divider type="vertical" style={styles.divider} />
    </>)
}