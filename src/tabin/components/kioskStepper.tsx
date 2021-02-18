import React from "react";
import { Stepper, IProps } from "./stepper";

export const KioskStepper = (props: IProps) => {
  const propDuplicate = { ...props };

  if (props.buttonStyle) {
    propDuplicate.buttonStyle = {
      ...props.buttonStyle,
    };
  } else {
    propDuplicate.buttonStyle = {};
  }

  return <Stepper {...propDuplicate} />;
};
