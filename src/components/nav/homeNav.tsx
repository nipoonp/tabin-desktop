import React, { useState, useEffect } from "react";
import { useAuth, AuthenticationStatus } from "../../context/auth-context";
// import { Menu } from "./menu";
import { Logger } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { useUser } from "../../context/user-context";
import {
  dashboardPath,
  landingPath,
  loginPath,
  signUpPath,
  configureNewEftposPath,
  beginOrderPath,
  registerListPath,
  // accountPath,
  // paymentPath,
  // termsPath,
  // privacyPath,
  // ordersPath,
  // rewardsPath,
} from "../main";
import { useSmallScreen } from "../../hooks/useWindowSize";
import { ReceiptIcon } from "../../tabin/components/receipt";
import { CreditCardBlankIcon } from "../../tabin/components/creditCardBlankIcon";
import { UserIcon } from "../../tabin/components/userIcon";
import { SignOutIcon } from "../../tabin/components/signOutIcon";
// import { supportContactUsRoute } from "../page/support/supportRoute";
// import { ForgotPasswordModal } from "../modals/auth/forgotPassword";
// import { ForgotPasswordResetModal } from "../modals/auth/forgotPasswordReset";
// import { LoginModal } from "../modals/auth/login";
// import { SignupModal } from "../modals/auth/signup";
// import { SignupConfirmModal } from "../modals/auth/signupConfirm";
import { GiftCardIcon } from "../../tabin/components/giftCardIcon";
import { createRestaurantAdminRoute } from "../page/createRestaurant/createRestaurant";
import { DashboardRestaurantList } from "../page/dashboardRestaurantList";

const styles = require("./homeNav.module.css");
const logger = new Logger("homeNav");

export const HomeNav = (props: {
  style?: React.CSSProperties;
  darkTheme?: boolean; // default true
  className?: string;
  children?: React.ReactNode;
}) => {
  // context
  const { isSmallScreen } = useSmallScreen();
  const history = useHistory();
  const { status, logout } = useAuth();
  const { user } = useUser();

  // states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSignupConfirmModal, setShowSignupConfirmModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [
    showForgotPasswordResetModal,
    setShowForgotPasswordResetModal,
  ] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (user && user.restaurants && user.restaurants.items.length > 0) {
      setShowDashboard(true);
    }
  }, [user]);

  useEffect(() => {
    if (
      showLoginModal ||
      showSignupModal ||
      showSignupConfirmModal ||
      showForgotPasswordModal ||
      showForgotPasswordResetModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [
    showLoginModal,
    showSignupModal,
    showSignupConfirmModal,
    showForgotPasswordModal,
    showForgotPasswordResetModal,
  ]);

  // logo callbacks
  const onLogoClick = () => {
    // if showing menu, press to unshow
    if (showMenu) {
      setShowMenu(false);
      return;
    }

    // if small screen, show menu
    if (isSmallScreen) {
      setShowMenu(true);
      return;
    }

    // redirect home
    history.push(landingPath);
  };

  // menu callbacks
  const onMenuDashboardClick = () => {
    history.push(dashboardPath);
  };

  // Login modal callbacks
  const onLoginClick = () => {
    // setShowLoginModal(true);
    history.push(loginPath);
  };

  const onLoggedIn = () => {
    setShowLoginModal(false);
  };

  const onLoginSwitch = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const onForgetPassword = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  // Sign up modal callbacks
  const onSignUpClick = () => {
    setShowSignupModal(true);
    history.push(signUpPath);
  };

  const onSignedUp = () => {
    setShowSignupModal(false);
    setShowSignupConfirmModal(true);
  };

  const onSignupSwitch = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  // Sign up confirmed callbacks
  const onSignupConfirmed = () => {
    setShowSignupConfirmModal(false);
  };

  // Forget password modal callbacks
  const onForgotPasswordToLogin = () => {
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const onForgotPasswordVerificationCodeSent = () => {
    setShowForgotPasswordModal(false);
    setShowForgotPasswordResetModal(true);
  };

  const onForgotPasswordResetToLogin = () => {
    setShowForgotPasswordResetModal(false);
    setShowLoginModal(true);
  };

  // const onMenuHome = () => {
  //     history.push(landingPath);
  //     setShowMenu(false);
  // };

  // const onMenuAccount = () => {
  //     history.push(accountPath);
  //     setShowMenu(false);
  // };

  // const onMenuPayment = () => {
  //     history.push(paymentPath);
  //     setShowMenu(false);
  // };

  // const onMenuContactUs = () => {
  //     history.push(supportContactUsRoute);
  //     setShowMenu(false);
  // };

  // const onMenuTermsOfService = () => {
  //     history.push(termsPath);
  //     setShowMenu(false);
  // };

  // const onMenuPrivacyPolicy = () => {
  //     history.push(privacyPath);
  //     setShowMenu(false);
  // };

  const onMenuSignup = () => {
    history.push(signUpPath);
    setShowMenu(false);
  };

  const onMenuLogin = () => {
    history.push(loginPath);
    setShowMenu(false);
  };

  const onMenuLogout = () => {
    logout();
    setShowMenu(false);
  };

  // constants
  const darkTheme = props.darkTheme === undefined ? true : props.darkTheme;

  const dropDownArrowRotation = () => {
    return showMenu ? "rotate(180deg)" : "rotate(0deg)";
  };

  // displays
  const logoDisplay = (
    <img
      alt="Tabin Logo"
      // style={{ height: "25px" }}
      style={isSmallScreen ? { height: "50px" } : { width: "120px" }}
      // src="https://tabin-public.s3-ap-southeast-2.amazonaws.com/logo/tabin-logo.png"
      src={
        isSmallScreen
          ? "https://tabin-public.s3-ap-southeast-2.amazonaws.com/logo/tabin-logo.png"
          : "https://tabin-public.s3-ap-southeast-2.amazonaws.com/logo/tabin-logo.png"
      }
    />
  );

  // const loginModal = (
  //     <LoginModal
  //         isOpen={showLoginModal}
  //         onClose={() => {
  //             setShowLoginModal(false);
  //         }}
  //         onLoggedIn={onLoggedIn}
  //         onSwitchToSignUp={onLoginSwitch}
  //         onForgetPassword={onForgetPassword}
  //     />
  // );

  // const signUpModal = (
  //     <SignupModal
  //         isOpen={showSignupModal}
  //         onClose={() => {
  //             setShowSignupModal(false);
  //         }}
  //         onSignedUp={onSignedUp}
  //         onSwitchToLogin={onSignupSwitch}
  //     />
  // );

  // const signupConfirmModal = (
  //     <SignupConfirmModal
  //         isOpen={showSignupConfirmModal}
  //         onClose={() => {
  //             setShowSignupConfirmModal(false);
  //         }}
  //         onSignupConfirmed={onSignupConfirmed}
  //     />
  // );

  // const forgotPasswordModal = (
  //     <ForgotPasswordModal
  //         isOpen={showForgotPasswordModal}
  //         onClose={() => {
  //             setShowForgotPasswordModal(false);
  //         }}
  //         onVerificationCodeSent={onForgotPasswordVerificationCodeSent}
  //         onBackToLogin={onForgotPasswordToLogin}
  //     />
  // );

  // const forgotPasswordResetModal = (
  //     <ForgotPasswordResetModal
  //         isOpen={showForgotPasswordResetModal}
  //         onClose={() => {
  //             setShowForgotPasswordResetModal(false);
  //         }}
  //         onBackToLogin={onForgotPasswordResetToLogin}
  //     />
  // );

  // const modals = (
  //     <>
  //         {showLoginModal && loginModal}
  //         {showSignupModal && signUpModal}
  //         {showSignupConfirmModal && signupConfirmModal}
  //         {showForgotPasswordModal && forgotPasswordModal}
  //         {showForgotPasswordResetModal && forgotPasswordResetModal}
  //     </>
  // );

  return (
    <>
      <div
        className={`${styles.nav} ${props.className ? props.className : ""}`}
        style={
          showMenu || !darkTheme
            ? { ...props.style, color: "rgb(48,48,48)" }
            : { ...props.style, color: "white" }
        }
      >
        <div style={{ display: "flex", width: "100%" }}>
          <button className={styles.logoContainer} onClick={onLogoClick}>
            {logoDisplay}
            {isSmallScreen || showMenu ? (
              <DropDownArrow
                style={{ transform: `${dropDownArrowRotation()}` }}
              />
            ) : (
              <></>
            )}
          </button>
          {!showMenu && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                paddingRight: "24px",
              }}
            >
              {props.children}
            </div>
          )}
        </div>
        {isSmallScreen || showMenu ? (
          <></>
        ) : (
          <div className={styles.links}>
            <nav>
              <ul className={styles.navContainer}>
                {/* <Link darkTheme={darkTheme}>Add your restaurant</Link> */}
                {status === AuthenticationStatus.SignedIn && user ? (
                  <div style={{ marginRight: "8px", display: "flex" }}>
                    {/* {showDashboard && (
                                                <Link
                                                    darkTheme={darkTheme}
                                                    onClick={onMenuDashboardClick}
                                                >
                                                    Dashboard
                                                </Link>
                                            )} */}
                    <MenuLink darkTheme={darkTheme} menu={<UserMenu />}>
                      {user.firstName}
                    </MenuLink>
                  </div>
                ) : (
                  <>
                    <Link darkTheme={darkTheme} onClick={onSignUpClick}>
                      Sign up
                    </Link>
                    <Link
                      cyData="login"
                      darkTheme={darkTheme}
                      onClick={onLoginClick}
                    >
                      Log in
                    </Link>
                  </>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
      {/* {modals} */}
      {showMenu && (
        <div className={styles.menuContainer}>
          {/* <Menu
                        onHome={onMenuHome}
                        onAccount={onMenuAccount}
                        onPayment={onMenuPayment}
                        onContactUs={onMenuContactUs}
                        onTermsOfService={onMenuTermsOfService}
                        onPrivacyPolicy={onMenuPrivacyPolicy}
                        onSignup={onMenuSignup}
                        onLogin={onMenuLogin}
                        onLogout={onMenuLogout}
                    /> */}
        </div>
      )}
    </>
  );
};

const DropDownArrow = (props: IDropDownArrowProps) => {
  return (
    <div className={styles.dropDownArrow} style={props.style}>
      <svg
        viewBox="0 0 18 18"
        role="presentation"
        aria-hidden="true"
        focusable="false"
        style={{
          height: "1em",
          width: "1em",
          display: "block",
          fill: "currentcolor",
        }}
      >
        <path
          d="m16.29 4.3a1 1 0 1 1 1.41 1.42l-8 8a1 1 0 0 1 -1.41 0l-8-8a1 1 0 1 1 1.41-1.42l7.29 7.29z"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

interface IDropDownArrowProps {
  style?: React.CSSProperties;
}

const Link = (props: ILinkProps) => {
  return (
    <button
      style={{
        padding: "0px 8px",
      }}
      onClick={props.onClick}
    >
      <li>
        <div
          className={
            props.darkTheme
              ? styles.navTextContainer
              : styles.navTextContainerLightBackground
          }
        >
          <div
            className={
              props.darkTheme ? styles.navText : styles.navTextLightBackground
            }
            cy-data={props.cyData ? props.cyData : ""}
          >
            {props.children}
          </div>
        </div>
      </li>
    </button>
  );
};

interface ILinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  darkTheme: boolean;
  cyData?: string;
}

const MenuLink = (props: IMenuLinkProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const onClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <button style={{ padding: "0px 8px" }} onClick={onClick}>
          <li>
            <div
              className={
                props.darkTheme
                  ? styles.navTextContainer
                  : styles.navTextContainerLightBackground
              }
            >
              <div
                className={
                  props.darkTheme
                    ? styles.navText
                    : styles.navTextLightBackground
                }
              >
                {props.children}
              </div>
            </div>
          </li>
        </button>
        {showMenu && (
          <div style={{ position: "absolute", right: "0px" }}>{props.menu}</div>
        )}
      </div>
    </>
  );
};

interface IMenuLinkProps {
  children: React.ReactNode;
  menu: React.ReactNode;
  darkTheme: boolean;
}

const UserMenu = () => {
  const { logout } = useAuth();
  const history = useHistory();

  const onCreateRestaurant = () => {
    history.push(createRestaurantAdminRoute);
  };


  const onKioskMode = () => {
    history.push(beginOrderPath);
  };

  const onDashboardRestaurantList = () => {
    history.push(dashboardPath);
  };

  const onConfigureNewEftpos = () => {
    history.push(configureNewEftposPath);
  };

  const onConfigureRegisters = () => {
    history.push(registerListPath);
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        minWidth: "280px",
        maxWidth: "950px",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 5px",
        borderTopWidth: "0px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgb(235, 235, 235)",
      }}
    >
      <ul className={styles.UsermenuUL}>
        <li className={styles.userMenuLI}>
          <button
            className={styles.userMenuLiButton}
            onClick={onCreateRestaurant}
          >
            <div>Create Restaurant</div>
            <ReceiptIcon height="20px" />
          </button>
          <button className={styles.userMenuLiButton} onClick={onKioskMode}>
            <div>Kiosk Mode</div>
            <GiftCardIcon height="20px" />
          </button>
          <button
            className={styles.userMenuLiButton}
            onClick={onDashboardRestaurantList}
          >
            <div>Restaurant Dashboards</div>
            <GiftCardIcon height="20px" />
          </button>
          <button
            className={styles.userMenuLiButton}
            onClick={onConfigureNewEftpos}
          >
            <div>Configure New Eftpos</div>
            <GiftCardIcon height="20px" />
          </button>
          <button
            className={styles.userMenuLiButton}
            onClick={onConfigureRegisters}
          >
            <div>Configure Registers</div>
            <GiftCardIcon height="20px" />
          </button>
          {/* <button className={styles.userMenuLiButton} onClick={onPayment}>
                        <div>Payment</div>
                        <CreditCardBlankIcon height="20px" />
                    </button>
                    <button className={styles.userMenuLiButton} onClick={onAccount}>
                        <div>Account</div>
                        <UserIcon height="20px" />
                    </button> */}
          <button className={styles.userMenuLiButton} onClick={logout}>
            <div>Log out</div>
            <SignOutIcon height="20px" />
          </button>
        </li>
      </ul>
    </div>
  );
};
