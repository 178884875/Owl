import Chat from "@/pages/main/chat";
import GlobalLayout from "../layouts/GlobalLayout";
import Login from "../pages/auth/login";
import MainLayout from "../pages/main";
import Welcome from "@/pages/main/welcome";
import ConsoleLayout from "@/pages/console";
import ConsoleWelcome from "@/pages/console/welcome";
import ConsoleChannel from "@/pages/console/channel";


const routes = [
    {
        element: <GlobalLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
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
                    }
                ]
            }
        ]
    }
] as any[];


export default routes;