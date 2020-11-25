import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth, AuthenticationStatus } from "../../../context/auth-context";
import { HomeNav } from "../../nav/homeNav";
import { isMobile } from "react-device-detect";
import { Logger } from "aws-amplify";
import { authRedirectPath, loginPath } from "../../main";
import * as yup from "yup";
import { useSmallScreen } from "../../../hooks/useWindowSize";
import { ButtonV2 } from "../../../tabin/components/buttonv2";
import {
  BoldFont,
  Title2Font,
  NormalFont,
} from "../../../tabin/components/fonts";
import { Space2, Space3 } from "../../../tabin/components/spaces";
import { ErrorMessage } from "../../../tabin/components/errorMessage";
import { ServerErrorV2 } from "../../../tabin/components/serverErrorv2";
import { InputV3 } from "../../../tabin/components/inputv3";
import { useTabNav } from "../../../context/tabNav-context";

const logger = new Logger("newInformationRequired");

const firstNameSchema = yup.string().required("Please enter your first name");
const lastNameSchema = yup.string().required("Please enter your last name");
const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters long")
  .required("Please enter a password");

export const NewInformationRequired = () => {
  const { email, completeNewPassword } = useAuth();
  const { isSmallScreen } = useSmallScreen();
  const history = useHistory();
  const { setSelectedTab } = useTabNav();

  useEffect(() => {
    setSelectedTab("login");
  }, []);

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [serverError, setServerError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { status } = useAuth();

  useEffect(() => {
    if (status === AuthenticationStatus.Unauthenticated) {
      history.replace(loginPath);
    }

    if (status === AuthenticationStatus.SignedIn) {
      history.push(authRedirectPath);
    }
  }, [status]);

  const onChangeFirstName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
    setFirstNameError("");
    setServerError("");
  };

  const onChangeLastName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
    setLastNameError("");
    setServerError("");
  };

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError("");
    setServerError("");
  };

  const onSignUp = async () => {
    setLoading(true);
    let fieldsValid = true;

    try {
      await firstNameSchema.validate(firstName);
      setFirstNameError("");
    } catch (e) {
      setFirstNameError(e.message);
      fieldsValid = false;
    }

    try {
      await lastNameSchema.validate(lastName);
      setLastNameError("");
    } catch (e) {
      setLastNameError(e.message);
      fieldsValid = false;
    }

    try {
      await passwordSchema.validate(password);
      setPasswordError("");
    } catch (e) {
      setPasswordError(e.message);
      fieldsValid = false;
    }

    if (fieldsValid) {
      try {
        await completeNewPassword(password, firstName, lastName);
        logger.debug("Successfully logged in");
        setLoading(false);
      } catch (e) {
        logger.debug("e", e);
        setServerError(e.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSignUp();
    }
  };

  const firstNameInput = (
    <>
      <InputV3
        name="firstName"
        label="First Name"
        type="text"
        onChange={onChangeFirstName}
        onKeyPress={onEnter}
        value={firstName}
        error={firstNameError ? true : false}
      />
    </>
  );

  const lastNameInput = (
    <>
      <InputV3
        name="lastName"
        label="Last Name"
        type="text"
        onChange={onChangeLastName}
        onKeyPress={onEnter}
        value={lastName}
        error={lastNameError ? true : false}
      />
    </>
  );

  const passwordInput = (
    <>
      <InputV3
        name="password"
        label="Password"
        type="password"
        onChange={onChangePassword}
        onKeyPress={onEnter}
        value={password}
        error={passwordError ? true : false}
      />
    </>
  );

  const loginButton = (
    <>
      <ButtonV2
        style={{ borderRadius: "8px", width: "100%" }}
        disabled={loading}
        onClick={onSignUp}
        loading={loading}
      >
        <BoldFont>LOG IN</BoldFont>
      </ButtonV2>
    </>
  );

  const content = (
    <>
      <div
        style={
          !isSmallScreen
            ? {
                padding: "24px",
                margin: "0 auto",
                width: "448px",
                border: "1px solid #e4e4e4",
              }
            : {}
        }
      >
        <Title2Font>Information required</Title2Font>
        <Space3 />
        <NormalFont>
          Please enter the following information to finish setting up of your
          account.
        </NormalFont>
        <Space3 />
        {serverError && (
          <>
            <ServerErrorV2 message={serverError} />
            <Space3 />
          </>
        )}
        <Space2 />
        {firstNameInput}
        {firstNameError && <ErrorMessage message={firstNameError} />}
        <Space2 />
        {lastNameInput}
        {lastNameError && <ErrorMessage message={lastNameError} />}
        <Space2 />
        {passwordInput}
        {passwordError && <ErrorMessage message={passwordError} />}
        <Space3 />
        {loginButton}
      </div>
    </>
  );

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div
        style={{
          minHeight: "100vh",
          maxWidth: "1080px",
          margin: "auto",
          padding: "24px",
          paddingTop: isSmallScreen ? "24px" : "40px",
          paddingBottom: isMobile ? "80px" : "unset", // for tab nav
        }}
      >
        {content}
      </div>
    </>
  );
};
