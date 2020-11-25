import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth, AuthenticationStatus } from "../../../context/auth-context";
import { HomeNav } from "../../nav/homeNav";
import { isMobile } from "react-device-detect";
import { Logger, Auth } from "aws-amplify";
import { toast } from "../../../tabin/components/toast";
import { loginPath } from "../../main";
import { useTabNav } from "../../../context/tabNav-context";
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

const logger = new Logger("Forgot password reset");

const verificationCodeSchema = yup
  // https://stackoverflow.com/questions/49886881/validation-using-yup-to-check-string-or-number-length
  // can't use .number, that doesn't work with leading zeros
  .string()
  .matches(/^[0-9]{6}$/, "The verification is exactly 6 digits long")
  .required("Please enter the verification code");
const newPasswordSchema = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters long");
const confirmPasswordSchema = yup
  .string()
  .required("Confirm password is required")
  .min(8, "Password must be at least 8 characters long");

export const ForgotPasswordReset = () => {
  const { isSmallScreen } = useSmallScreen();
  const { email } = useAuth();
  const history = useHistory();
  const { setSelectedTab } = useTabNav();

  useEffect(() => {
    setSelectedTab("login");
  }, []);

  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [serverError, setServerError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    if (!email) {
      history.replace(loginPath);
    }
  });

  const onChangeVerificationCode = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(event.target.value);
    setVerificationCodeError("");
    setServerError("");
  };

  const onChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value);
    setNewPasswordError("");
    setServerError("");
  };

  const onChangeConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    setConfirmPasswordError("");
    setServerError("");
  };

  const onResetPassword = async () => {
    setLoading(true);
    let fieldsValid = true;

    try {
      await verificationCodeSchema.validate(verificationCode);
      setVerificationCodeError("");
    } catch (e) {
      setVerificationCodeError(e.message);
      fieldsValid = false;
    }

    try {
      await newPasswordSchema.validate(newPassword);
      setNewPasswordError("");
    } catch (e) {
      setNewPasswordError(e.message);
      fieldsValid = false;
    }

    try {
      await confirmPasswordSchema.validate(confirmPassword);
      setConfirmPasswordError("");
    } catch (e) {
      setConfirmPasswordError(e.message);
      fieldsValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      fieldsValid = false;
    }

    if (fieldsValid) {
      try {
        await Auth.forgotPasswordSubmit(
          email ? email : "",
          verificationCode,
          newPassword
        );
        toast.success(`Successfully reset password for ${email}`);
        setLoading(false);
        history.push(loginPath);
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
      onResetPassword();
    }
  };

  const verificationCodeInput = (
    <>
      <InputV3
        name="verificationCode"
        label="Verification Code"
        type="text"
        onChange={onChangeVerificationCode}
        onKeyPress={onEnter}
        value={verificationCode}
        error={verificationCodeError ? true : false}
      />
    </>
  );

  const newPasswordInput = (
    <>
      <InputV3
        name="newPassword"
        label="New Password"
        type="password"
        onChange={onChangeNewPassword}
        onKeyPress={onEnter}
        value={newPassword}
        error={newPasswordError ? true : false}
      />
    </>
  );

  const confirmNewPasswordInput = (
    <>
      <InputV3
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        onChange={onChangeConfirmPassword}
        onKeyPress={onEnter}
        value={confirmPassword}
        error={confirmPasswordError ? true : false}
      />
    </>
  );

  const resetPasswordButton = (
    <>
      <ButtonV2
        style={{ borderRadius: "8px", width: "100%" }}
        disabled={loading}
        onClick={onResetPassword}
        loading={loading}
      >
        <BoldFont>RESET PASSWORD</BoldFont>
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
          Your new password needs to have at least 8 characters.
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
        <Space2 />
        {newPasswordInput}
        {newPasswordError && <ErrorMessage message={newPasswordError} />}
        <Space2 />
        {confirmNewPasswordInput}
        {confirmPasswordError && (
          <ErrorMessage message={confirmPasswordError} />
        )}
        <Space3 />
        {resetPasswordButton}
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
