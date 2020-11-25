import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { H4 } from "../../../tabin/components/headings";
import { Button } from "../../../tabin/components/button";
import { Link } from "../../../tabin/components/link";
import ImagePicker from "../../../tabin/components/imagePicker";
import { Logger } from "aws-amplify";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import { IS3Image } from "../../../model/model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { Space2, Space4, Space1 } from "../../../tabin/components/spaces";
import { Separator } from "../../../tabin/components/separator";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";
import { createRestaurantOperatingHoursRoute } from "./createRestaurant";

const logger = new Logger("CreateRestaurantPhotos");
const styles = require("./photos.module.css");

export default (props: RouteComponentProps) => {
  const { image, saveImage } = useCreateRestaurant();
  const [uploadedImage, setUploadedImage] = useState<IS3Image | null>(image);

  const onSetUploadedImage = (uploadedImage: IS3Image | null) => {
    logger.debug("uploadedImage", uploadedImage);
    setUploadedImage(uploadedImage);
  };

  const onBack = () => {
    props.history.goBack();
  };

  const onSubmit = () => {
    logger.debug(uploadedImage);
    saveImage(uploadedImage);
    props.history.push(createRestaurantOperatingHoursRoute);
  };

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div>Step 4/6</div>
          <Space2 />
          <H4>Cover Photo</H4>
          <Space2 />
          <ImagePicker
            uploadedImage={uploadedImage}
            setUploadedImage={onSetUploadedImage}
          />
          <Space1 />
          <div className={styles.submitButton}>
            <Link onClick={onBack}>
              <FontAwesomeIcon icon={faChevronLeft as any} />
              <span className={styles.back}>Back</span>
            </Link>
            <Button
              cyData="create-restaurant-photos-next"
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
