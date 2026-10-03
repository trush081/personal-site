import type { ReactNode } from 'react';

import Navigation from './Navigation';
import SideBar from './SideBar';

interface MainProps {
  children?: ReactNode;
  fullPage?: boolean;
}

const Main = ({ children = null, fullPage = false }: MainProps) => (
  <div id="wrapper">
    <Navigation />
    <div id="main">
      {children}
    </div>
    {fullPage ? null : <SideBar />}
  </div>
);

export default Main;
