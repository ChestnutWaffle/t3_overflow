import { useState } from "react";
import NavBar from "../navbar";
import SideBar from "../PageComponents/Sidebar";
import Drawer from "../PageComponents/Drawer";

type LayoutProps = {
  children: JSX.Element;
};

const Layout = ({ children }: LayoutProps) => {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  return (
    <div className="flex flex-col pt-14 text-gray-700 dark:text-gray-300">
      <div className="fixed top-0 left-0 z-10 w-full">
        <NavBar setMobileSidebar={setMobileSidebar} />
      </div>
      <div className="relative flex h-full justify-between">
        <div className="fixed left-0 top-[60px] z-10 overflow-x-hidden border-r border-gray-300 dark:border-gray-800 ">
          <div className="hidden lg:block">
            <SideBar />
          </div>
          <Drawer isOpen={mobileSidebar} setIsOpen={setMobileSidebar}>
            <SideBar className="lg:hidden" />
          </Drawer>
        </div>
        <div className="-ml-1 h-full w-full border-l bg-gray-300 pl-1 pt-1 dark:bg-gray-900 lg:ml-0 lg:pl-[200px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
