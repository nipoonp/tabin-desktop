import React, { useEffect } from "react";
import { Space2, Space1 } from "../../../tabin/components/spaces";
import { H3, H4, H5 } from "../../../tabin/components/headings";
import { P } from "../../../tabin/components/paragraph";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";

const styles = require("./getBackToYou.module.css");

export default () => {
  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <H4>
            Thanks for your interest! We'll contact you in about 1-3 business
            days.
          </H4>
          <Space2 />
          <H5>What this will cover:</H5>
          <Space1 />
          <P>- Set up your menu</P>
          <Space1 />
          <P>- Review pricing and fees</P>
        </div>
      </div>
    </>
  );
};
