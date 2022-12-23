// import { Sidebar } from "flowbite-react";

import CustomSidebar from "../sidebar";
import React from "react";

interface SideBarProps {
  className?: string;
}

const SideBar = ({ className }: SideBarProps) => {
  return (
    <div
      className={`mx-auto w-fit overflow-y-auto ${
        className !== undefined ? className : ""
      } sidebar`}
    >
      <CustomSidebar />
    </div>
  );
};

export default SideBar;
