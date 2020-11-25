import React from "react";

const styles = require("./dashboardContentWrapper.module.css");

export default (props: IProps) => {
  return (
    <>
      <div className={styles.dashboardContentWrapper}>{props.children}</div>
    </>
  );
};

interface IProps {
  children: React.ReactNode;
}
