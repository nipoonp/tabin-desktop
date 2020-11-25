import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/fontawesome-free-solid";

export default (props: IProps) => {
  return (
    <>
      <span onClick={props.onClick} style={{ padding: "20px" }}>
        <FontAwesomeIcon icon={faChevronRight as any} />
      </span>
    </>
  );
};

interface IProps {
  onClick: () => void;
}
