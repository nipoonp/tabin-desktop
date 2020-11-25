import React from "react";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import { RouteComponentProps } from "react-router";
import { Logger } from "aws-amplify";
import { Button } from "../../../tabin/components/button";
import { Link } from "../../../tabin/components/link";
import { H4, H6 } from "../../../tabin/components/headings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { Space2, Space4, Space3 } from "../../../tabin/components/spaces";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";
import {
  createRestaurantPhotosRoute,
  createRestaurantAddressRoute,
} from "./createRestaurant";
import { GoogleMapSelectLocation } from "../../../tabin/components/googleMapSelectLocation";

const styles = require("./location.module.css");
const logger = new Logger("createRestaurantLocation");

export default (props: RouteComponentProps) => {
  const { location, saveLocation } = useCreateRestaurant();

  if (!location) {
    logger.debug(
      "No location found, routing to ",
      createRestaurantAddressRoute
    );
    props.history.push(createRestaurantAddressRoute);
  }

  const onLocationSave = (location: { lat: number; lng: number }) => {
    saveLocation(location);
  };

  const onBack = () => {
    props.history.goBack();
  };

  const onSubmit = () => {
    props.history.push(createRestaurantPhotosRoute);
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.containerWrapper}>
        <div className={styles.container}>
          <div>Step 3/6</div>
          <Space2 />
          <H4>Is the pin in the right place?</H4>
          <Space2 />
          <H6>
            If needed, you can adjust the map so the pin is in the right
            location. Once the restaurant is confirmed it will appear on Tabin,
            allowing customers to find your restaurant and place orders.
          </H6>
          <Space3 />
          <div className={styles.map}>
            <GoogleMapSelectLocation
              onLocationSave={onLocationSave}
              center={location!}
            />
          </div>
          <Space3 />
          <div className={styles.submitButton}>
            <Link onClick={onBack}>
              <FontAwesomeIcon icon={faChevronLeft as any} />
              <span className={styles.back}>Back</span>
            </Link>
            <Button
              cyData="create-restaurant-location-next"
              className={styles.button}
              onClick={onSubmit}
            >
              Yes, that's right
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
