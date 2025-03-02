import { getIsMobile } from '@/utils/platform';
import { FC, PropsWithChildren, ReactNode } from 'react';

interface ServerLayoutProps<T> {
  Desktop: FC<T>;
  Mobile: FC<T>;
}

interface ServerLayoutInnerProps {
  children: ReactNode;
}

const ServerLayout = ({ Desktop, Mobile }: ServerLayoutProps<ServerLayoutInnerProps>): FC<PropsWithChildren> => {
  const ServerLayoutComponent: FC<PropsWithChildren> = ({ children }) => {
    const isMobile = getIsMobile();
    return isMobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
  };
  
  return ServerLayoutComponent;
};

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
