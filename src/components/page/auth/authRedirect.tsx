import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";
// import { landingPath } from "../../main";

export default () => {
  const history = useHistory();

  useEffect(() => {
    const path = sessionStorage.getItem("authRedirectPath");

    history.replace(path ? path : "/");
  }, []);

  return (
    <>
      <FullScreenSpinner show={true} text="Redirecting" />
    </>
  );
};
