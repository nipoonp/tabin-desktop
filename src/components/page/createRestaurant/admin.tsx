import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth-context";
import { RouteComponentProps } from "react-router-dom";
import { Button } from "../../../tabin/components/button";
import Input from "../../../tabin/components/input";
import { Logger } from "aws-amplify";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import { H4, H6 } from "../../../tabin/components/headings";
import { Space2, Space4, Space3 } from "../../../tabin/components/spaces";
import { Separator } from "../../../tabin/components/separator";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";
import { createRestaurantGeneralRoute } from "./createRestaurant";

const logger = new Logger("CreateRestaurantAdmin");
const styles = require("./admin.module.css");

export default (props: RouteComponentProps) => {
  const {
    restaurantManagerId,
    saveRestaurantManagerId,
  } = useCreateRestaurant();
  const [_restaurantManagerID, setRestaurantManagerID] = useState(
    restaurantManagerId
  );
  const [restaurantManagerIDError, setRestaurantManagerIDError] = useState("");

  const onChangeRestaurantManagerID = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRestaurantManagerID(event.target.value);
    setRestaurantManagerIDError("");
  };

  const onSubmit = () => {
    if (!_restaurantManagerID) {
      setRestaurantManagerIDError("Please enter a valid ID");
    } else {
      saveRestaurantManagerId(_restaurantManagerID);
      props.history.push(createRestaurantGeneralRoute);
    }
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <H4>Enter the userID of the restaurant manager</H4>
          <Space3 />
          <Input
            cyData="create-restaurant-restaurantManagerID"
            title="RestaurantManagerID"
            placeholder="Enter restaurant ManagerID"
            value={_restaurantManagerID}
            onChange={onChangeRestaurantManagerID}
            error={restaurantManagerIDError}
          />
          <Space3 />
          <div className={styles.submitButton}>
            <Button
              cyData="create-restaurant-admin-next"
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
