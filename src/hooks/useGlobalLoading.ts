import { useState } from "react";

const useGlobalLoading = () => {
  const [globalLoading, setGlobalLoading] = useState(false);

  return { globalLoading, setGlobalLoading };
};

export default useGlobalLoading;
