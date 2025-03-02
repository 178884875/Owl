import { lazy, Suspense } from "react";
import GlobalLayout from "../layouts/GlobalLayout";
import MainLayout from "../pages/main";
import ConsoleLayout from "@/pages/console";
import LoadingSpinner from "@/components/LoadingSpinner";
// 懒加载所有页面组件
const Chat = lazy(() => import("@/pages/main/chat"));
const Login = lazy(() => import("../pages/auth/login"));
const Welcome = lazy(() => import("@/pages/main/welcome"));
const ConsoleWelcome = lazy(() => import("@/pages/console/welcome"));
const ConsoleChannel = lazy(() => import("@/pages/console/channel"));
const User = lazy(() => import("@/pages/console/user"));
const Register = lazy(() => import("@/pages/auth/register"));
const OAuth = lazy(() => import("@/pages/auth/oauth"));
const Profile = lazy(() => import("@/pages/main/profile"));
const About = lazy(() => import("@/pages/about"));
const Help = lazy(() => import("@/pages/help"));
const Model = lazy(() => import("@/pages/console/model"));
const Invite = lazy(() => import("@/pages/invite"));

const routes = [
    {
        element: <GlobalLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Suspense fallback={<LoadingSpinner />}><Login /></Suspense>
            },
            {
                path: '/auth/register',
                element: <Suspense fallback={<LoadingSpinner />}><Register /></Suspense>
            },
            {
                path: '/auth/oauth',
                element: <Suspense fallback={<LoadingSpinner />}><OAuth /></Suspense>
            },
            {
                path: '/about',
                element: <Suspense fallback={<LoadingSpinner />}><About /></Suspense>
            },
            {
                path: '/help',
                element: <Suspense fallback={<LoadingSpinner />}><Help /></Suspense>
            },
            {
                path:'/invite/:id',
                element: <Suspense fallback={<LoadingSpinner />}><Invite /></Suspense>
            },
            {
                element: <MainLayout />,
                children: [
                    {
                        path: '/',
                        element: <Suspense fallback={<LoadingSpinner />}><Welcome /></Suspense>
                    },
                    {
                        path: '/chat',
                        element: <Suspense fallback={<LoadingSpinner />}><Chat /></Suspense>
                    },
                    {
                        path: '/profile',
                        element: <Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>
                    }
                ]
            },
            {
                path: "/console",
                element: <ConsoleLayout />,
                children: [
                    {
                        path: "",
                        element: <Suspense fallback={<LoadingSpinner />}><ConsoleWelcome /></Suspense>
                    },
                    {
                        path: "/console/channel",
                        element: <Suspense fallback={<LoadingSpinner />}><ConsoleChannel /></Suspense>
                    },
                    {
                        path: "/console/user",
                        element: <Suspense fallback={<LoadingSpinner />}><User /></Suspense>
                    },
                    {
                        path: "/console/model",
                        element: <Suspense fallback={<LoadingSpinner />}><Model /></Suspense>
                    }
                ]
            }
        ]
    }
] as any[];

export default routes;