
import ServerLayout from '@/components/ServerLayout';
import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Layout = ServerLayout({ Desktop, Mobile });

Layout.displayName = 'SideMenuLayout';

export default Layout;


