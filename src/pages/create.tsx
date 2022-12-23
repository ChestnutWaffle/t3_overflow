import { useUser } from "@context/UserContext";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import _404 from "./404";

const Create = dynamic(() =>
  import("../components/PageComponents/Create").then((mod) => mod.default), {
    loading: ({  }) => <p>Loading...</p>
  }
);

const CreatePage: NextPage = () => {
  const { userData } = useUser();

  if (userData.emailVerified) {
    return <Create />;
  }

  return <_404 />;
};

export default CreatePage;
