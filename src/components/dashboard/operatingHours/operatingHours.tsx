import React, { useState } from "react";
import { Button } from "../../../tabin/components/button";
import OperatingHours from "../../common/operatingHours/operatingHours";
import { PureQueryOptions } from "apollo-client/core/types";
import { Logger } from "aws-amplify";
import { useMutation } from "react-apollo-hooks";
import { UPDATE_RESTAURANT } from "../dashboardGraphQL";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";
import { toast } from "../../../tabin/components/toast";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_OPERATING_HOURS,
  IGET_DASHBOARD_OPERATING_TIMES,
} from "../../../graphql/customQueries";
import { H4 } from "../../../tabin/components/headings";

const styles = require("./operatingHours.module.css");
const logger = new Logger("DashboardOperatingHours");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const operatingHoursTmp: IGET_DASHBOARD_OPERATING_HOURS =
    props.restaurant.operatingHours;
  let monday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let tuesday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let wednesday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let thursday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let friday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let saturday: IGET_DASHBOARD_OPERATING_TIMES[] = [];
  let sunday: IGET_DASHBOARD_OPERATING_TIMES[] = [];

  operatingHoursTmp.monday.map((timeSlot) =>
    monday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.tuesday.map((timeSlot) =>
    tuesday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.wednesday.map((timeSlot) =>
    wednesday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.thursday.map((timeSlot) =>
    thursday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.friday.map((timeSlot) =>
    friday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.saturday.map((timeSlot) =>
    saturday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );
  operatingHoursTmp.sunday.map((timeSlot) =>
    sunday.push({
      openingTime: timeSlot.openingTime,
      closingTime: timeSlot.closingTime,
    })
  );

  const operatingHoursTmp2: IGET_DASHBOARD_OPERATING_HOURS = {
    monday: monday,
    tuesday: tuesday,
    wednesday: wednesday,
    thursday: thursday,
    friday: friday,
    saturday: saturday,
    sunday: sunday,
  };

  const [
    operatingHours,
    setOperatingHours,
  ] = useState<IGET_DASHBOARD_OPERATING_HOURS | null>(operatingHoursTmp2);

  const updateRestaurant = useMutation(UPDATE_RESTAURANT, {
    update: (proxy, mutationResult) => {
      toast.success("Restaurant operating hours successfully updated");
      setShowFullScreenSpinner(false);
    },
    refetchQueries: props.refetchRestaurant,
  });

  const onSetOperatingHours = (
    operatingHours: IGET_DASHBOARD_OPERATING_HOURS
  ) => {
    setOperatingHours(operatingHours);
  };

  const onSubmit = () => {
    setShowFullScreenSpinner(true);
    updateRestaurant({
      variables: {
        id: props.restaurant.id,
        operatingHours: operatingHours,
      },
    });
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <div className={styles.dashboardHeader}>
        <H4>Operating Hours</H4>
        <Button className={styles.button} onClick={onSubmit}>
          Save
        </Button>
      </div>
      <OperatingHours
        operatingHours={operatingHours}
        setOperatingHours={onSetOperatingHours}
      />
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
}
