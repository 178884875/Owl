import { Outlet } from "react-router-dom";

import { Flexbox } from 'react-layout-kit';

import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';
import { ConfigProvider } from "antd";
dayjs.locale('zh-cn');

export default function GlobalLayout() {
    return (<Flexbox style={{
        flex: 1,
        overflow: 'hidden',
    }}>
        <ConfigProvider locale={zhCN}>
            <Outlet />
        </ConfigProvider>
    </Flexbox>)
}