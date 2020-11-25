import React, { useState, useEffect } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { HomeNav } from "../../nav/homeNav";
import * as yup from "yup";
import { Logger } from "aws-amplify";
import { useTabNav } from "../../../context/tabNav-context";
import { useAuth } from "../../../context/auth-context";
import { useSmallScreen } from "../../../hooks/useWindowSize";
import {
  Title2Font,
  NormalFont,
  BoldFont,
} from "../../../tabin/components/fonts";
import { Space3, Space2 } from "../../../tabin/components/spaces";
import { ServerErrorV2 } from "../../../tabin/components/serverErrorv2";
import { InputV3 } from "../../../tabin/components/inputv3";
import { ErrorMessage } from "../../../tabin/components/errorMessage";
import { ButtonV2 } from "../../../tabin/components/buttonv2";
import { isMobile } from "react-device-detect";
import { loginPath, forgotPasswordResetPath } from "../../main";
import { Link } from "../../../tabin/components/link";

const logger = new Logger("Forgot password");

const emailSchema = yup
  .string()
  .email("Please enter a valid email address")
  .required("Please enter an email address");

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { isSmallScreen } = useSmallScreen();
  const history = useHistory();
  const { setSelectedTab } = useTabNav();

  useEffect(() => {
    setSelectedTab("login");
  }, []);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [serverError, setServerError] = useState("");
  const [emailError, setEmailError] = useState("");

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailError("");
    setServerError("");
  };

  const onSendResetLink = async () => {
    setLoading(true);
    let fieldsValid = true;

    try {
      await emailSchema.validate(email);
      setEmailError("");
    } catch (e) {
      setEmailError(e.message);
      fieldsValid = false;
    }

    if (fieldsValid) {
      try {
        await forgotPassword(email);
        logger.debug("Forgot password done");
        setLoading(false);
        history.push(forgotPasswordResetPath);
      } catch (e) {
        logger.debug("e", e);
        setServerError(e.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const onBackToLogin = () => {
    history.push(loginPath);
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSendResetLink();
    }
  };

  const emailInput = (
    <>
      <InputV3
        name="email"
        label="Email"
        type="text"
        onChange={onChangeEmail}
        onKeyPress={onEnter}
        value={email}
        error={emailError ? true : false}
      />
    </>
  );

  const sendResetLinkButton = (
    <>
      <ButtonV2
        style={{ borderRadius: "8px", width: "100%" }}
        disabled={loading}
        onClick={onSendResetLink}
        loading={loading}
      >
        <BoldFont>SEND RESET LINK</BoldFont>
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
        <Title2Font>Reset password</Title2Font>
        <Space3 />
        <NormalFont>
          Enter the email address associated with your account, and we’ll email
          you a verification code to reset your password.
        </NormalFont>
        <Space3 />
        {serverError && (
          <>
            <ServerErrorV2 message={serverError} />
            <Space3 />
          </>
        )}
        {emailInput}
        {emailError && <ErrorMessage message={emailError} />}
        <Space3 />
        <Link onClick={onBackToLogin}>Back to login</Link>
        <Space3 />
        {sendResetLinkButton}
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
