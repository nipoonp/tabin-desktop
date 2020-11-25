import React from "react";
import { Button } from "../../tabin/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/fontawesome-free-solid";
import { H4 } from "../../tabin/components/headings";
import { SizedBox } from "../../tabin/components/sizedBox";
import { useAuth } from "../../context/auth-context";

const styles = require("./dashboardHeaderNew.module.css");

export default (props: IProps) => {
  const { isAdmin } = useAuth();

  const deleteAll = () => {
    const confirm = window.confirm("Are you sure you want to delete all?");

    if (confirm) {
      props.onDeleteAll && props.onDeleteAll();
    }
  };

  return (
    <>
      <div className={styles.dashboardHeader}>
        <H4>{props.title}</H4>
        <div>
          <Button className={styles.button} onClick={() => props.onCreateNew()}>
            <FontAwesomeIcon icon={faPlus as any} />
            <span className={styles.addNew}>Add New</span>
          </Button>
          {isAdmin && props.onDeleteAll && (
            <>
              <SizedBox width="12px" />
              <Button className={styles.button} onClick={deleteAll}>
                <FontAwesomeIcon icon={faTrash as any} />
                <span className={styles.addNew}>Delete All</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface IProps {
  title: string;
  onCreateNew: () => void;
  onDeleteAll?: () => void;
}
