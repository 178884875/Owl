import { useEffect } from "react";
import { Flexbox } from "react-layout-kit";
import { useNavigate } from 'react-router-dom'
import SideMenu from "./side-menu";
import Workspace from "./workspace";


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
            <Workspace />
        </Flexbox>
    )
}