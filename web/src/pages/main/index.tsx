import { useEffect } from "react";
import { Flexbox } from "react-layout-kit";
import { Outlet, useNavigate } from 'react-router-dom'
import SideMenu from "./side-menu/layout";

export default function Chat() {
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/auth/login')
        }

    }, [])

    return (
        <Flexbox style={{
            height: '100vh',
        }}
            horizontal
        >
            <SideMenu />
            <Outlet/>
        </Flexbox>
    )
}