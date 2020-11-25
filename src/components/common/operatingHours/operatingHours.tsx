import React, { useState } from "react";
import OperatingHoursTimeDropdown from "./operatingHoursTimeDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faMinusCircle,
} from "@fortawesome/fontawesome-free-solid";
import { IOperatingHours, IOperatingTimes } from "../../../model/model";
import { Checkbox } from "../../../tabin/components/checkbox";
import { Logger } from "aws-amplify";
import {
  timeStringToDate,
  dateToTimeString,
} from "../../../util/timeConversion";

const logger = new Logger("Create Restaurant Operating Hours");
const styles = require("./operatingHours.module.css");

const defaultStartTime = "09:00";
const defaultEndTime = "17:00";
const timeSlotInterval = 15;

export default (props: IProps) => {
  const { operatingHours, setOperatingHours } = props;

  if (!operatingHours) {
    let defaultOperatingHours = {
      monday: [{ openingTime: defaultStartTime, closingTime: defaultEndTime }],
      tuesday: [{ openingTime: defaultStartTime, closingTime: defaultEndTime }],
      wednesday: [
        { openingTime: defaultStartTime, closingTime: defaultEndTime },
      ],
      thursday: [
        { openingTime: defaultStartTime, closingTime: defaultEndTime },
      ],
      friday: [{ openingTime: defaultStartTime, closingTime: defaultEndTime }],
      saturday: [
        { openingTime: defaultStartTime, closingTime: defaultEndTime },
      ],
      sunday: [{ openingTime: defaultStartTime, closingTime: defaultEndTime }],
    };

    setOperatingHours(defaultOperatingHours);
  }

  const onSetOperatingHours = (operatingHours: IOperatingHours) => {
    logger.debug("operatingHours", operatingHours);
    setOperatingHours(operatingHours);
  };

  const addIntervalToDate = (date: Date, interval: number) => {
    let minutes = date.getMinutes() + interval;

    date.setMinutes(minutes);

    return date;
  };

  const onAddTimeGroup = (day: string) => {
    if (!operatingHours) {
      return;
    }

    let timeGroup: IOperatingHours = { ...operatingHours };
    let timeGroupSize = timeGroup[day].length;

    let operatingTime = timeStringToDate(
      timeGroup[day][timeGroupSize - 1].closingTime
    );
    let operatingTimeWithInterval = addIntervalToDate(
      operatingTime,
      timeSlotInterval
    );

    let closingTime = timeStringToDate(
      timeGroup[day][timeGroupSize - 1].closingTime
    );
    let closingTimeWithInterval = addIntervalToDate(
      closingTime,
      timeSlotInterval * 2
    );

    timeGroup[day].push({
      openingTime: dateToTimeString(operatingTimeWithInterval),
      closingTime: dateToTimeString(closingTimeWithInterval),
    });
    setOperatingHours(timeGroup);
  };

  const onRemoveTimeGroup = (day: string, dayTimeGroup: number) => {
    if (!operatingHours) {
      return;
    }

    let timeGroup: IOperatingHours = { ...operatingHours };

    timeGroup[day] = timeGroup[day].filter(
      (timeGroup, indx) => indx != dayTimeGroup
    );
    setOperatingHours(timeGroup);
  };

  return (
    <>
      {operatingHours &&
        Object.keys(operatingHours).map((day: string) => (
          <>
            <div className={styles.operatingHoursWrapper}>
              <OperatingHourDay
                day={day}
                operatingHours={operatingHours}
                setOperatingHours={onSetOperatingHours}
              />
              <div>
                {operatingHours[day].map(
                  (operatingTime: IOperatingTimes, index: number) => (
                    <OperatingTimeGroup
                      firstItem={index == 0}
                      day={day}
                      dayTimeGroup={index}
                      operatingTime={operatingTime}
                      onAddTimeGroup={onAddTimeGroup}
                      onRemoveTimeGroup={onRemoveTimeGroup}
                      operatingHours={operatingHours}
                      setOperatingHours={onSetOperatingHours}
                      convertOperatingHourToDate={timeStringToDate}
                    />
                  )
                )}
              </div>
            </div>
          </>
        ))}
    </>
  );
};

interface IOperatingHourDay {
  day: string;
  operatingHours: IOperatingHours;
  setOperatingHours: (operatingHours: IOperatingHours) => void;
}

const OperatingHourDay = (props: IOperatingHourDay) => {
  const { day, operatingHours, setOperatingHours } = props;

  const onClickDayOpen = () => {
    let operatingHoursTemp = { ...operatingHours };

    operatingHoursTemp[day].push({
      openingTime: defaultStartTime,
      closingTime: defaultEndTime,
    });
    setOperatingHours(operatingHoursTemp);
  };

  const onClickDayClose = () => {
    let operatingHoursTemp = { ...operatingHours };

    operatingHoursTemp[day] = [];
    setOperatingHours(operatingHoursTemp);
  };

  return (
    <>
      <div className={styles.operatingHourDay}>
        <div className={styles.day}>{day.toUpperCase()}</div>

        <div className={styles.checkboxWrapper}>
          <Checkbox
            cyData="operating-hours-day-open-checkbox"
            checked={operatingHours[day].length > 0 ? true : false}
            onCheck={() => onClickDayOpen()}
            onUnCheck={() => onClickDayClose()}
          />
        </div>

        <div className={styles.checkboxText}>
          <div>{operatingHours[day].length > 0 ? "Open" : "Closed"}</div>
        </div>
      </div>
    </>
  );
};

interface IOperatingTimeGroup {
  firstItem: boolean;
  day: string;
  dayTimeGroup: number;
  operatingTime: IOperatingTimes;
  onAddTimeGroup?: (day: string) => void;
  onRemoveTimeGroup?: (day: string, dayTimeGroup: number) => void;
  operatingHours: IOperatingHours;
  setOperatingHours: (operatingHours: IOperatingHours) => void;
  convertOperatingHourToDate: (operatingHour: string) => Date;
}

const OperatingTimeGroup = (props: IOperatingTimeGroup) => {
  const {
    firstItem,
    day,
    dayTimeGroup,
    operatingTime,
    onAddTimeGroup,
    onRemoveTimeGroup,
    operatingHours,
    setOperatingHours,
    convertOperatingHourToDate,
  } = props;

  const onSelectTime = (
    time: Date | null,
    day: string,
    dayTimeGroup: number,
    isOpeningTime: boolean
  ) => {
    let newTimeGroup: IOperatingHours = { ...operatingHours };
    let newTime = time
      ? ("0" + time.getHours()).slice(-2) +
        ":" +
        (time.getMinutes() + "0").slice(0, 2)
      : "";

    if (isOpeningTime) {
      newTimeGroup[day][dayTimeGroup].openingTime = newTime;
    } else {
      newTimeGroup[day][dayTimeGroup].closingTime = newTime;
    }

    setOperatingHours(newTimeGroup);
  };

  const getOperatingStartTime = () => {
    if (dayTimeGroup == 0) {
      return getStartOfDay();
    } else {
      return convertOperatingHourToDate(
        operatingHours[day][dayTimeGroup - 1].closingTime
      );
    }
  };

  const getOperatingEndTime = () => {
    return convertOperatingHourToDate(operatingTime.closingTime);
  };

  const getClosingStartTime = () => {
    return convertOperatingHourToDate(operatingTime.openingTime);
  };

  const getClosingEndTime = () => {
    if (dayTimeGroup == operatingHours[day].length - 1) {
      return getEndOfDay();
    } else {
      return convertOperatingHourToDate(
        operatingHours[day][dayTimeGroup + 1].openingTime
      );
    }
  };

  const getStartOfDay = () => {
    let date = new Date();

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };

  const getEndOfDay = () => {
    let date = new Date();

    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(59);

    return date;
  };

  return (
    <>
      <div className={styles.operatingTimeGroup}>
        <div className={styles.operatingTime}>
          <OperatingHoursTimeDropdown
            cyData="operating-hours-opening-time"
            day={day}
            dayTimeGroup={dayTimeGroup}
            value={convertOperatingHourToDate(operatingTime.openingTime)}
            startTime={getOperatingStartTime()}
            endTime={getOperatingEndTime()}
            isOpeningTime={true}
            onSelectTime={onSelectTime}
          />
        </div>
        <div className={styles.operatingHoursTimeDropdownSeparator}>to</div>
        <div className={styles.operatingTime}>
          <OperatingHoursTimeDropdown
            cyData="operating-hours-closing-time"
            day={day}
            dayTimeGroup={dayTimeGroup}
            value={convertOperatingHourToDate(operatingTime.closingTime)}
            startTime={getClosingStartTime()}
            endTime={getClosingEndTime()}
            isOpeningTime={false}
            onSelectTime={onSelectTime}
          />
        </div>
        {onAddTimeGroup && firstItem && (
          <AddTimeGroupIcon onAddTimeGroup={onAddTimeGroup} day={day} />
        )}
        {onRemoveTimeGroup && !firstItem && (
          <RemoveTimeGroupIcon
            onRemoveTimeGroup={onRemoveTimeGroup}
            day={day}
            dayTimeGroup={dayTimeGroup}
          />
        )}
      </div>
    </>
  );
};

const AddTimeGroupIcon = (props: IAddTimeGroupIcon) => {
  return (
    <>
      <div
        cy-data="operating-time-group-add"
        onClick={() => props.onAddTimeGroup(props.day)}
      >
        <FontAwesomeIcon
          className={styles.addRemoveTimeGroupIcon}
          icon={faPlusCircle as any}
        />
      </div>
    </>
  );
};

const RemoveTimeGroupIcon = (props: IRemoveTimeGroupIcon) => {
  return (
    <>
      <div
        cy-data="operating-time-group-remove"
        onClick={() =>
          props.onRemoveTimeGroup &&
          props.onRemoveTimeGroup(props.day, props.dayTimeGroup)
        }
      >
        <FontAwesomeIcon
          className={styles.addRemoveTimeGroupIcon}
          icon={faMinusCircle as any}
        />
      </div>
    </>
  );
};

interface IAddTimeGroupIcon {
  onAddTimeGroup: (day: string) => void;
  day: string;
}

interface IRemoveTimeGroupIcon {
  onRemoveTimeGroup: (day: string, dayTimeGroup: number) => void;
  day: string;
  dayTimeGroup: number;
}

interface IProps {
  operatingHours: IOperatingHours | null;
  setOperatingHours: (operatingHours: IOperatingHours) => void;
}
