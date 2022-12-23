import { Sidebar as FlowSideBar } from "flowbite-react";
import dynamic from "next/dynamic";
import NavLink from "./NavLink";
import { AiOutlineHome, AiOutlineTags } from "react-icons/ai";

import { FiUsers } from "react-icons/fi";

const EmailVerify = dynamic(() => import("./EmailVerify"));

const AskLink = dynamic(() => import("./AskLink"));

const CustomSidebar = () => {
  return (
    <>
      <FlowSideBar style={{ width: "200px" }}>
        <FlowSideBar.Items>
          <FlowSideBar.ItemGroup>
            <li className="cursor-pointer">
              <NavLink
                exact={true}
                href={"/"}
                icon={AiOutlineHome}
                label="Home"
              />
            </li>
            <li className="cursor-pointer">
              <NavLink
                exact={false}
                href={"/tags"}
                icon={AiOutlineTags}
                label="Tags"
              />
            </li>
            <li className="cursor-pointer">
              <NavLink
                exact={false}
                href={"/users"}
                icon={FiUsers}
                label="Users"
              />
            </li>
          </FlowSideBar.ItemGroup>

          <AskLink />

          <EmailVerify />
        </FlowSideBar.Items>
        <div className="mb-12"></div>
      </FlowSideBar>
    </>
  );
};

export default CustomSidebar;
