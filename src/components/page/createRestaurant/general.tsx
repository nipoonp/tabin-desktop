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
import { createRestaurantAddressRoute } from "./createRestaurant";

const logger = new Logger("CreateRestaurantGeneral");
const styles = require("./general.module.css");

export default (props: RouteComponentProps) => {
  const { user } = useAuth();
  const {
    saveName,
    name,
    saveDescription,
    description,
  } = useCreateRestaurant();
  const [_name, setName] = useState(name);
  const [_description, setDescription] = useState(description);
  const [nameError, setNameError] = useState("");

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError("");
  };

  const onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const onSubmit = () => {
    if (!_name) {
      setNameError("Please enter a valid name");
    } else {
      saveName(_name);
      saveDescription(_description);
      props.history.push(createRestaurantAddressRoute);
    }
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div>STEP 1/6</div>
          <Space2 />
          <H4>
            Hi, {user && user.attributes.name}! Let’s get started listing your
            restaurant.
          </H4>
          <Space2 />
          <H6>Lets learn a little about your restaurant</H6>
          <Space3 />
          <Input
            cyData="create-restaurant-name"
            title="Name"
            placeholder="Enter restaurant name"
            value={_name}
            onChange={onChangeName}
            error={nameError}
          />
          <Space2 />
          <Input
            cyData="create-restaurant-description"
            title="Description"
            showOptionalInTitle={true}
            placeholder="Enter a description for the restaurant"
            value={_description ? _description : ""}
            onChange={onChangeDescription}
          />
          <Space3 />
          <div className={styles.submitButton}>
            <Button
              cyData="create-restaurant-general-next"
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
