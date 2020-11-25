import React, { useState, useEffect } from "react";
import { Button } from "../../../tabin/components/button";
import { Link } from "../../../tabin/components/link";
import { H4 } from "../../../tabin/components/headings";
import { RouteComponentProps } from "react-router";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import OperatingHoursObject from "../../common/operatingHours/operatingHours";
import { IOperatingHours } from "../../../model/model";
import { Logger } from "aws-amplify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { Space2, Space4, Space3 } from "../../../tabin/components/spaces";
import { Separator } from "../../../tabin/components/separator";
import { isMobile } from "react-device-detect";
import { createRestaurantSummaryRoute } from "./createRestaurant";
import { HomeNav } from "../../nav/homeNav";

const logger = new Logger("Create Restaurant Operating Hours");
const styles = require("./operatingHours.module.css");

export default (props: RouteComponentProps) => {
  const { operatingHours, saveOperatingHours } = useCreateRestaurant();

  const [_operatingHours, setOperatingHours] = useState<IOperatingHours | null>(
    operatingHours
  );

  const onSetOperatingHours = (operatingHours: IOperatingHours) => {
    setOperatingHours(operatingHours);
  };

  const onBack = () => {
    props.history.goBack();
  };

  const onSubmit = () => {
    logger.debug(operatingHours);
    if (_operatingHours) {
      saveOperatingHours(_operatingHours);
    }

    props.history.push(createRestaurantSummaryRoute);
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div>STEP 5/6</div>
          <Space2 />
          <H4>What are your restaurant's operating times?</H4>
          <Space2 />
          <OperatingHoursObject
            operatingHours={_operatingHours}
            setOperatingHours={onSetOperatingHours}
          />
          <Space3 />
          <div className={styles.submitButton}>
            <Link onClick={onBack}>
              <FontAwesomeIcon icon={faChevronLeft as any} />
              <span className={styles.back}>Back</span>
            </Link>
            <Button
              cyData="create-restaurant-operating-hours-next"
              className={styles.button}
              onClick={onSubmit}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
