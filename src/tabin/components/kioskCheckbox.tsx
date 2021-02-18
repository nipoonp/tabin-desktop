import React from "react";
import { IProps, Checkbox } from "./checkbox";

export const KioskCheckbox = (props: IProps) => {
  const propDuplicate = { ...props };

  if (props.style) {
    propDuplicate.style = {
      ...props.style,
    };

    propDuplicate.boxStyle = {
      height: "28px",
      width: "28px",
      ...props.boxStyle,
    };
  } else {
    propDuplicate.style = {};
    propDuplicate.boxStyle = { height: "28px", width: "28px" };
  }

  return <Checkbox {...propDuplicate} />;
};
