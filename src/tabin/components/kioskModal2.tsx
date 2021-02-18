import React from "react";
import ReactModal, { Props } from "react-modal";

export const KioskModal2 = (
  props: Props & {
    children: React.ReactNode;
  }
) => {
  return (
    <>
      <ReactModal
        style={{
          overlay: {
            zIndex: 102 /* above homeNav */,
            overflow: "scroll",
            // all properties must be defined (to overwrite defaults)
            position: "fixed",
            backgroundColor: "rgba(38, 38, 38, 0.8)"
          },
          content: {
            marginBottom: "none",
            // all properties must be defined (to overwrite defaults)
            position: "absolute",
            top: "256px",
            right: "128px",
            bottom: "256px",
            left: "128px",
            border: "none",
            borderRadius: "20px",
            backgroundColor: "#FFFFFF",
            overflow: "auto",
            padding: "0",
          },
        }}
        {...props}
      >
        {props.children}
      </ReactModal>
    </>
  );
};
