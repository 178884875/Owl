import { Flexbox } from "react-layout-kit";
import { useChatStore } from "@/store/chat";
import { Button, Drawer, Input, FloatButton } from "antd";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import Session from "../session";
import { useEffect, useCallback, useState } from "react";
import UserInfo from "../user-info";
import CreateSession from "../create-session";

const styles = {
  floatButton: {
    top: 20,
    left: 20,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  drawerContent: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: '10px 0',
  },
  searchWrapper: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
  },
};

export default function SideMenu() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch, loadSessions] = useChatStore(state => [
    state.searchSessionValue, 
    state.setSearchSessionValue, 
    state.loadSessions
  ]);

  const onSearch = useCallback((value?: string) => {
    loadSessions(value || '');
  }, [loadSessions]);

  useEffect(() => {
    onSearch(search);
  }, [search, onSearch]);

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  return (
    <>
      <FloatButton
        icon={<PanelLeftOpen size={20} />}
        onClick={showDrawer}
        style={styles.floatButton}
        type="text"
        tooltip="打开菜单"
        shape="circle"
      />
      
      <Drawer
        placement="left"
        onClose={closeDrawer}
        open={visible}
        width={300}
        closable={false}
        bodyStyle={{ padding: 0 }}
      >
        <div style={styles.drawerContent}>
          <Flexbox horizontal style={styles.header}>
            <Flexbox style={styles.searchWrapper}>
              <Input.Search
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索"
              />
            </Flexbox>
            <Button
              style={styles.closeButton}
              onClick={closeDrawer}
              type="text"
              icon={<PanelLeftClose />}
            />
          </Flexbox>
          
          <Flexbox style={{ flex: 1, overflow: 'auto', padding: '0 10px' }}>
            <Session />
          </Flexbox>
          
          <Flexbox style={{ padding: '10px' }}>
            <UserInfo />
            <CreateSession />
          </Flexbox>
        </div>
      </Drawer>
    </>
  );
}

