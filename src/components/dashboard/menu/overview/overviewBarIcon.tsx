import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/fontawesome-free-solid";
import { DraggableProvided } from "react-beautiful-dnd";

export default (props: IProps) => {
  return (
    <>
      <span {...props.provided.dragHandleProps} style={{ padding: "20px" }}>
        <FontAwesomeIcon icon={faBars as any} />
      </span>
    </>
  );
};

interface IProps {
  provided: DraggableProvided;
}
