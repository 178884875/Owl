import Chat from "@/pages/main/chat";
import GlobalLayout from "../layouts/GlobalLayout";
import Login from "../pages/auth/login";
import MainLayout from "../pages/main";
import Welcome from "@/pages/main/welcome";
import ConsoleLayout from "@/pages/console";
import ConsoleWelcome from "@/pages/console/welcome";
import ConsoleChannel from "@/pages/console/channel";
import User from "@/pages/console/user";
import Register from "@/pages/auth/register";
import OAuth from "@/pages/auth/oauth";
import Profile from "@/pages/main/profile";
import About from "@/pages/about";
import Help from "@/pages/help";
import Model from "@/pages/console/model";
import Invite from "@/pages/invite";

const routes = [
    {
        element: <GlobalLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
            },
            {
                path: '/auth/register',
                element: <Register />
            },
            {
                path: '/auth/oauth',
                element: <OAuth />
            },
            {
                path: '/about',
                element: <About />
            },
            {
                path: '/help',
                element: <Help />
            },
            {
                path:'/invite/:id',
                element: <Invite />
            },
            {
                element: <MainLayout />,
                children: [
                    {
                        path: '/',
                        element: <Welcome />
                    },
                    {
                        path: '/chat',
                        element: <Chat />
                    },
                    {
                        path: '/profile',
                        element: <Profile />
                    }
                ]
            },
            {
                path: "/console",
                element: <ConsoleLayout />,
                children: [
                    {
                        path: "",
                        element: <ConsoleWelcome />
                    },
                    {
                        path: "/console/channel",
                        element: <ConsoleChannel />
                    },
                    {
                        path: "/console/user",
                        element: <User />
                    },
                    {
                        path: "/console/model",
                        element: <Model />
                    }
                ]
            }
        ]
    }
] as any[];


export default routes;