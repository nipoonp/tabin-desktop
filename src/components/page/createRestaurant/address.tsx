import React, { useState, useEffect } from "react";

import { GoogleAutoCompleteInput } from "../../../tabin/components/googleAutoCompleteInput";
import { Logger } from "aws-amplify";
import Input from "../../../tabin/components/input";
import { Button } from "../../../tabin/components/button";
import { Link } from "../../../tabin/components/link";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import { RouteComponentProps, useHistory } from "react-router";
import { H4, H6 } from "../../../tabin/components/headings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { Space2, Space4, Space3 } from "../../../tabin/components/spaces";
import { Separator } from "../../../tabin/components/separator";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";
import { createRestaurantLocationRoute } from "./createRestaurant";

const styles = require("./address.module.css");
const logger = new Logger("createRestaurantAddress");

export default () => {
  const {
    saveLocation,
    location,
    saveAddress,
    address,
  } = useCreateRestaurant();
  const history = useHistory();

  const [_location, setLocation] = useState(location);
  const [_formattedAddress, setFormattedAddress] = useState(
    address.formattedAddress
  );
  const [_aptSuite, setAptSuite] = useState(address.aptSuite);
  const [addressError, setAddressError] = useState("");

  const onSelectedAddress = (
    formattedAddress: string,
    lat: number,
    lng: number
  ) => {
    setFormattedAddress(formattedAddress);
    setLocation({ lat, lng });
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAptSuite(event.target.value);
  };

  const onAddressChange = () => {
    if (addressError) {
      setAddressError("");
    }
  };

  const onBack = () => {
    history.goBack();
  };

  const onSubmit = () => {
    logger.debug("Submitting _location", _location);
    if (!_location) {
      setAddressError("Please enter a valid address");
    } else {
      saveLocation(_location);
      saveAddress({ formattedAddress: _formattedAddress, aptSuite: _aptSuite });
      history.push(createRestaurantLocationRoute);
    }
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div>STEP 2/6</div>
          <Space2 />
          <H4>Location of your restaurant</H4>
          <Space2 />
          <H6>This will allow customers to easily find your restaurant</H6>
          <Space3 />
          <div>
            <div className={styles.streetAddressInputTitle}>Street Address</div>
            <div cy-data="create-restaurant-address-street">
              {/* TODO handle addressError && styling */}
              <GoogleAutoCompleteInput
                initialValue={_formattedAddress}
                onSelectedAddress={onSelectedAddress}
                onInputChange={onAddressChange}
              />
            </div>
            <Space2 />
            <Input
              cyData="create-restaurant-address-apt"
              title="Apt / Suite"
              showOptionalInTitle={true}
              placeholder={"Apt / Suite"}
              value={_aptSuite ? _aptSuite : ""}
              onChange={onInputChange}
            />
          </div>
          <Space3 />
          <div className={styles.submitButton}>
            <Link onClick={onBack}>
              <FontAwesomeIcon icon={faChevronLeft as any} />
              <span className={styles.back}>Back</span>
            </Link>
            <Button
              cyData="create-restaurant-address-next"
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
