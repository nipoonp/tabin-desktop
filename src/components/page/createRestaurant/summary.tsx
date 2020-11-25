import React, { useState, useEffect } from "react";
import { Button } from "../../../tabin/components/button";
import { Link } from "../../../tabin/components/link";
import { H3, H1, H5, H6 } from "../../../tabin/components/headings";
import { RouteComponentProps } from "react-router";
import { useCreateRestaurant } from "../../../context/createRestaurant-context";
import { S3Image } from "aws-amplify-react";
import { Logger } from "aws-amplify";
import OperatingHoursSimpleDisplay from "../../common/operatingHours/operatingHoursSimpleDisplay";
import { toast } from "../../../tabin/components/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { Space2, Space4, Space3 } from "../../../tabin/components/spaces";
import { Separator } from "../../../tabin/components/separator";
import { Checkbox } from "../../../tabin/components/checkbox";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../../nav/homeNav";
import { createRestaurantGetBackToYouRoute } from "./createRestaurant";

const logger = new Logger("CreateRestaurantSummary");
const styles = require("./summary.module.css");

export default (props: RouteComponentProps) => {
  const {
    name,
    description,
    address,
    image,
    operatingHours,
    create,
  } = useCreateRestaurant();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTermsError, setAgreeTermsError] = useState("");
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const onBack = () => {
    props.history.goBack();
  };

  const onSubmit = async () => {
    if (!agreeTerms) {
      setAgreeTermsError("You must agree to the terms and conditions");
      return;
    }

    setShowFullScreenSpinner(true);

    try {
      await create();
      props.history.push(createRestaurantGetBackToYouRoute);
    } catch (e) {
      logger.debug("error", e);
      toast.error(
        "There was an error processing your request. Please contact a Tabin representative."
      );
    } finally {
      setShowFullScreenSpinner(false);
    }
  };

  const onAgreeTerms = () => {
    setAgreeTerms(true);
    setAgreeTermsError("");
  };

  const onDisagreeTerms = () => {
    setAgreeTerms(false);
    setAgreeTermsError("");
  };

  const onLinkTermsOfService = () => {
    props.history.push("/terms");
  };

  return (
    <>
      <FullScreenSpinner
        show={showFullScreenSpinner}
        text="Creating restaurant..."
      />
      {!isMobile && <HomeNav darkTheme={false} />}
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <H3>Summary</H3>
          <Space2 />
          <H6>Confirm the details for your restaurant</H6>
          <Space3 />
          <div className={styles.summaryFieldWrapper}>
            <div className={styles.summaryField}>Name</div>
            <div>{name}</div>
          </div>
          <Space2 />
          <div className={styles.summaryFieldWrapper}>
            <div className={styles.summaryField}>Description</div>
            <div>{description}</div>
          </div>
          <Space2 />
          <div className={styles.summaryFieldWrapper}>
            <div className={styles.summaryField}>Address</div>
            <div>{address.formattedAddress}</div>
          </div>
          <Space2 />
          <div className={styles.summaryFieldWrapper}>
            <div className={styles.summaryField}>Apt Suite</div>
            <div>{address.aptSuite}</div>
          </div>
          {image && (
            <>
              <Space2 />
              <div className={styles.summaryFieldWrapper}>
                <div className={styles.summaryField}>Photo</div>
                <div className={styles.summaryImage}>
                  <S3Image
                    level="protected"
                    imgKey={image.key}
                    theme={{
                      photoImg: { width: "100%", height: "100%" },
                    }}
                  />
                </div>
              </div>
            </>
          )}
          {operatingHours && (
            <>
              <Space2 />
              <div className={styles.summaryFieldWrapper}>
                <div className={styles.summaryField}>Operating Hours</div>
                <OperatingHoursSimpleDisplay operatingHours={operatingHours} />
              </div>
            </>
          )}
          <Space4 />
          <Checkbox
            cyData="create-restaurant-agree-terms"
            checked={agreeTerms}
            onCheck={onAgreeTerms}
            onUnCheck={onDisagreeTerms}
            error={agreeTermsError}
          >
            By clicking submit, you agree to our{" "}
            <div className={styles.termsLinkWrapper}>
              <a
                className={styles.termsLink}
                href="http://www.tabin.co.nz/terms"
                target="_blank"
              >
                terms of service
              </a>
            </div>
          </Checkbox>
          <Space3 />
          <div className={styles.submitButton}>
            <Link onClick={onBack}>
              <FontAwesomeIcon icon={faChevronLeft as any} />
              <span className={styles.back}>Back</span>
            </Link>
            <Button
              cyData="create-restaurant-summary-next"
              className={styles.button}
              onClick={onSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
