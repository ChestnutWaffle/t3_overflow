import { Sidebar as FlowSideBar } from "flowbite-react";
import NavLink from "./NavLink";
import { AiOutlinePlus } from "react-icons/ai";
import { useUser } from "@context/UserContext";

const AskLink = () => {
  const user = useUser();

  if (!!user.userData.email && user.userData.emailVerified)
    return (
      <FlowSideBar.ItemGroup>
        <li className="cursor-pointer">
          <NavLink
            exact={true}
            href={"/create"}
            icon={AiOutlinePlus}
            label={"Ask"}
          />
        </li>
      </FlowSideBar.ItemGroup>
    );

  return null;
};

export default AskLink;
