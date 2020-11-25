import React from "react";
import { HomeNav } from "../nav/homeNav";
import { isMobile } from "react-device-detect";

export const Landing = (props: {

}) => {

    return (
        <>
            {!isMobile && <HomeNav darkTheme={false} />}
            <div style={{ padding: "24px" }}>
                Welcome to Tabin!
            </div>
        </>
    );
};
