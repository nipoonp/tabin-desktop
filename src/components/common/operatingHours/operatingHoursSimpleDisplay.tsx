import React from "react";
import { IOperatingHours, IOperatingTimes } from "../../../model/model";

const styles = require("./operatingHoursSimpleDisplay.module.css");

export default (props: IProps) => {
  const operatingHours = props.operatingHours;

  return (
    <div className={styles.container}>
      {Object.keys(operatingHours).map((day: string) => (
        <div className={styles.operatingHoursDayGroup}>
          <div className={styles.day}>
            <div>{day.toUpperCase()}</div>
          </div>
          <div>
            {operatingHours[day].map(
              (operatingTime: IOperatingTimes, index: number) => (
                <div className={styles.timeGroup}>
                  {operatingTime.openingTime} - {operatingTime.closingTime}
                </div>
              )
            )}
            {operatingHours[day].length === 0 && (
              <div className={styles.timeGroup}>CLOSED</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface IProps {
  operatingHours: IOperatingHours;
}
