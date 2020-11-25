import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth, AuthenticationStatus } from "../../../context/auth-context";
import { HomeNav } from "../../nav/homeNav";
import { isMobile } from "react-device-detect";
import { Logger } from "aws-amplify";
import { authRedirectPath, signUpPath, loginPath } from "../../main";
import * as yup from "yup";
import { useSmallScreen } from "../../../hooks/useWindowSize";
import { ButtonV2 } from "../../../tabin/components/buttonv2";
import {
  BoldFont,
  Title2Font,
  NormalFont,
} from "../../../tabin/components/fonts";
import { Space3 } from "../../../tabin/components/spaces";
import { ErrorMessage } from "../../../tabin/components/errorMessage";
import { ServerErrorV2 } from "../../../tabin/components/serverErrorv2";
import { InputV3 } from "../../../tabin/components/inputv3";
import { Link } from "../../../tabin/components/link";
import { toast } from "../../../tabin/components/toast";
import { useTabNav } from "../../../context/tabNav-context";

const logger = new Logger("Sign up confirm");

const verificationCodeSchema = yup
  // https://stackoverflow.com/questions/49886881/validation-using-yup-to-check-string-or-number-length
  // can't use .number, that doesn't work with leading zeros
  .string()
  .matches(/^[0-9]{6}$/, "The verification is exactly 6 digits long")
  .required("Please enter the verification code");

export const SignupConfirm = () => {
  const { isSmallScreen } = useSmallScreen();
  const history = useHistory();
  const { setSelectedTab } = useTabNav();

  useEffect(() => {
    setSelectedTab("login");
  }, []);

  const { email, resendCode, confirmEmail } = useAuth();
  const [resendingVerificationCode, setResendingVerificationCode] = useState(
    false
  );
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [serverError, setServerError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");

  const { status } = useAuth();

  useEffect(() => {
    if (status === AuthenticationStatus.Unauthenticated) {
      history.replace(loginPath);
    }

    if (status === AuthenticationStatus.SignedIn) {
      history.push(authRedirectPath);
    }
  }, [status]);

  const onSignUpConfirm = async () => {
    setLoading(true);
    let fieldsValid = true;

    try {
      await verificationCodeSchema.validate(verificationCode);
      setVerificationCodeError("");
    } catch (e) {
      setVerificationCodeError(e.errors[0]);
      fieldsValid = false;
    }

    if (fieldsValid) {
      try {
        await confirmEmail(email ? email : "", verificationCode);
        logger.info("Verification complete");
      } catch (e) {
        logger.debug("e", e);
        setServerError(e.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const onChangeVerificationCode = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(event.target.value);
    setVerificationCodeError("");
    setServerError("");
  };

  const resendVerificationCode = async () => {
    setResendingVerificationCode(true);
    try {
      await resendCode(email ? email : "");
      toast.success(`${"A new verification code has been sent to"} ${email}`);
      setResendingVerificationCode(false);
    } catch (e) {
      logger.error("Failed to resend verification code: ", e);
      setResendingVerificationCode(false);
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSignUpConfirm();
    }
  };

  const verificationCodeInput = (
    <>
      <InputV3
        name="verificationCode"
        label="Verification Code"
        type="verificationCode"
        onChange={onChangeVerificationCode}
        onKeyPress={onEnter}
        value={verificationCode}
        error={verificationCodeError ? true : false}
      />
    </>
  );

  const signupConfirmButton = (
    <>
      <ButtonV2
        style={{ borderRadius: "8px", width: "100%" }}
        disabled={loading || resendingVerificationCode}
        onClick={onSignUpConfirm}
        loading={loading || resendingVerificationCode}
      >
        <BoldFont>CONTINUE</BoldFont>
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
        <Title2Font>Confirm email</Title2Font>
        <Space3 />
        <NormalFont>
          A verification code has been sent to {email}. Please enter the code
          below.
        </NormalFont>
        <Space3 />
        {serverError && (
          <>
            <ServerErrorV2 message={serverError} />
            <Space3 />
          </>
        )}
        {verificationCodeInput}
        {verificationCodeError && (
          <ErrorMessage message={verificationCodeError} />
        )}
        <Space3 />
        <Link onClick={resendVerificationCode}>Resend code</Link>
        <Space3 />
        {signupConfirmButton}
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
