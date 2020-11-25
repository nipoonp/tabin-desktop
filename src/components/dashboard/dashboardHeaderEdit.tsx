import React from "react";
import { Button } from "../../tabin/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faTrashAlt } from "@fortawesome/fontawesome-free-solid";

const styles = require("./dashboardHeaderEdit.module.css");

export default (props: IProps) => {
  return (
    <>
      <div className={styles.dashboardHeader}>
        <div onClick={() => props.onBack()} className={styles.backWrapper}>
          <FontAwesomeIcon icon={faChevronLeft as any} />
          <span className={styles.back}>Back</span>
        </div>
        <div className={styles.editWrapper}>
          <Button className={styles.button} onClick={props.onSave}>
            Save
          </Button>
          {props.showDelete && (
            <div className={styles.delete} onClick={props.onDelete}>
              <FontAwesomeIcon icon={faTrashAlt as any} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface IProps {
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
  showDelete: boolean;
}
