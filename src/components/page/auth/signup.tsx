import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { HomeNav } from "../../nav/homeNav";
import { isMobile } from "react-device-detect";
import { Logger, Auth } from "aws-amplify";
import { authRedirectPath, loginPath, signUpConfirmPath } from "../../main";
import * as yup from "yup";
import { useSmallScreen } from "../../../hooks/useWindowSize";
import { ButtonV2 } from "../../../tabin/components/buttonv2";
import {
  BoldFont,
  Title2Font,
  NormalFont,
} from "../../../tabin/components/fonts";
import { Space2, Space3, Space4 } from "../../../tabin/components/spaces";
import { ErrorMessage } from "../../../tabin/components/errorMessage";
import { ServerErrorV2 } from "../../../tabin/components/serverErrorv2";
import { InputV3 } from "../../../tabin/components/inputv3";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { FacebookLoginButton } from "../../../tabin/components/auth/facebookLoginButton";
import { GoogleLoginButton } from "../../../tabin/components/auth/googleLoginButton";
import { Link } from "../../../tabin/components/link";
import { Separator, Separator3 } from "../../../tabin/components/separator";
import { useTabNav } from "../../../context/tabNav-context";

const logger = new Logger("Sign up");

const emailSchema = yup
  .string()
  .email("Please enter a valid email address")
  .required("Please enter an email address");
const firstNameSchema = yup.string().required("Please enter your first name");
const lastNameSchema = yup.string().required("Please enter your last name");
const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters long")
  .required("Please enter a password");

export const Signup = () => {
  const { register } = useAuth();
  const [signUpWithEmail, setSignUpWithEmail] = useState(false);
  const { isSmallScreen } = useSmallScreen();
  const history = useHistory();
  const { setSelectedTab } = useTabNav();

  useEffect(() => {
    setSelectedTab("login");
  }, []);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [serverError, setServerError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailError("");
    setServerError("");
  };

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
  const onSignUpWithEmail = () => {
    setSignUpWithEmail(true);
  };

  const onSignUp = async () => {
    setLoading(true);
    let fieldsValid = true;

    try {
      await emailSchema.validate(email);
      setEmailError("");
    } catch (e) {
      setEmailError(e.errors[0]);
      fieldsValid = false;
    }

    try {
      await firstNameSchema.validate(firstName);
      setFirstNameError("");
    } catch (e) {
      setFirstNameError(e.errors[0]);
      fieldsValid = false;
    }

    try {
      await lastNameSchema.validate(lastName);
      setLastNameError("");
    } catch (e) {
      setLastNameError(e.errors[0]);
      fieldsValid = false;
    }

    try {
      await passwordSchema.validate(password);
      setPasswordError("");
    } catch (e) {
      setPasswordError(e.errors[0]);
      fieldsValid = false;
    }

    if (fieldsValid) {
      try {
        await register(email, password, firstName, lastName);
        logger.debug("Successfully logged up");
        setLoading(false);
        history.push(signUpConfirmPath);
      } catch (e) {
        logger.debug("e", e);
        setServerError(e.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSignUp();
    }
  };

  const onFacebookLogin = () => {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
    });
  };

  const onGoogleLogin = () => {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });
  };

  const onSwitchToLogin = () => {
    history.push(loginPath);
  };

  const socialMediaLogin = (
    <>
      {signUpWithEmail ? (
        <div style={{ textAlign: "center", fontWeight: 500 }}>
          Sign up with <Link onClick={onFacebookLogin}>Facebook</Link> or{" "}
          <Link onClick={onGoogleLogin}>Google</Link>
        </div>
      ) : (
        <>
          <FacebookLoginButton />
          <Space2 />
          <GoogleLoginButton />
        </>
      )}
    </>
  );

  const orSeparator = (
    <>
      <div
        style={{
          position: "relative",
          padding: "32px 0",
        }}
      >
        <Separator />
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "0 24px",
          }}
        >
          or
        </div>
      </div>
    </>
  );

  const emailInput = (
    <>
      <InputV3
        name="email"
        label="Email"
        type="text"
        onChange={onChangeEmail}
        onKeyPress={onKeyPress}
        value={email}
        error={emailError ? true : false}
      />
    </>
  );

  const firstNameInput = (
    <>
      <InputV3
        name="firstName"
        label="First Name"
        type="text"
        onChange={onChangeFirstName}
        onKeyPress={onKeyPress}
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
        onKeyPress={onKeyPress}
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
        onKeyPress={onKeyPress}
        value={password}
        error={passwordError ? true : false}
      />
    </>
  );

  const signupButton = (
    <>
      <ButtonV2
        style={{ borderRadius: "8px", width: "100%" }}
        disabled={loading}
        onClick={onSignUp}
        loading={loading}
      >
        <BoldFont>SIGN UP</BoldFont>
      </ButtonV2>
    </>
  );

  const signUpWithEmailButton = (
    <>
      <ButtonV2 style={{ borderRadius: "8px" }} onClick={onSignUpWithEmail}>
        <BoldFont>SIGN UP WITH EMAIL</BoldFont>
      </ButtonV2>
    </>
  );

  const alreadyHaveAnAccount = (
    <>
      <div style={{ fontSize: "16px" }}>
        <span>Already have an account?</span>
        <Link onClick={onSwitchToLogin} style={{ margin: "0px 8px" }}>
          Log in
        </Link>
      </div>
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
        <Title2Font>Sign up</Title2Font>
        <Space4 />
        {socialMediaLogin}
        {orSeparator}
        {signUpWithEmail ? (
          <>
            {serverError && (
              <>
                <ServerErrorV2 message={serverError} />
                <Space3 />
              </>
            )}
            {emailInput}
            {emailError && <ErrorMessage message={emailError} />}
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
            {signupButton}
          </>
        ) : (
          <>{signUpWithEmailButton}</>
        )}
        <Separator3 />
        {alreadyHaveAnAccount}
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
