import React, { useState, FunctionComponent } from "react";
import {
  // BrowserRouter as Router,
  Router,
  Route,
  Switch,
  Redirect,
  withRouter,
  RouteComponentProps,
  RouteProps,
  useLocation,
} from "react-router-dom";
import { Restaurant } from "./page/restaurant";
import { NoMatch } from "./page/error/404";
import Unauthorised from "./page/error/unauthorised";
import { DashboardRestaurantList } from "./page/dashboardRestaurantList";
// import { Dashboard } from "./page/dashboard2";
import { Dashboard } from "./page/dashboard";
import { Dashboard as OldDashboard } from "./page/dashboard";
import Modal from "react-modal";
// import { Profile } from "./page/profile";
// import Favourites from "./page/favourites";
import AuthRedirect from "./page/auth/authRedirect";
import { Login } from "./page/auth/login";
import { NewInformationRequired } from "./page/auth/newInformationRequired";
import { Signup } from "./page/auth/signup";
import { SignupConfirm } from "./page/auth/signupConfirm";
import { ForgotPassword } from "./page/auth/forgotPassword";
import { ForgotPasswordReset } from "./page/auth/forgotPasswordReset";
// import Account from "./page/account";
// import { Payment } from "./page/payment";
import { Checkout } from "./page/checkout";
// import { Rewards } from "./page/rewards";
// import { VerifyPhone } from "./page/auth/verifyPhone";
// import { VerifyPhoneConfirm } from "./page/auth/verifyPhoneConfirm";
// import Terms from "./page/legal/terms";
// import Privacy from "./page/legal/privacy";
// import { SupportRoute } from "./page/support/supportRoute";

import { useAuth, AuthenticationStatus } from "../context/auth-context";

import "react-toastify/dist/ReactToastify.min.css";
import { Logger } from "aws-amplify";
// import { Orders } from "./page/orders";
import { useUser } from "../context/user-context";
import { ToastContainer } from "../tabin/components/toast";
import CreateRestaurant from "./page/createRestaurant/createRestaurant";
// import { TabNavProvider } from "../context/tabNav-context";

// import { Search } from "./page/search";

import { Landing } from "./page/landing";
import { RegisterList } from "./page/registerList";
// import LandingBusiness from "./page/landingBusiness";
import { createBrowserHistory } from "history";
// import { BetaInvitation } from "./page/betaInvitation";
// import { BetaProvider, useBeta } from "../context/beta-context";
// import { Notify } from "./page/notify";
// import { TabNav } from "./nav/tabNav";
// import { usePageViews } from "../hooks/usePageView";
// import { useUpdateTabNavOnLocation } from "../hooks/useUpdateTabNavOnLocation";
import { useAuthRedirectURL } from "../hooks/useAuthRedirectURL";
import { FullScreenSpinner } from "../tabin/components/fullScreenSpinner";
import { BeginOrder } from "./page/beginOrder";
import { OrderType } from "./page/orderType";
import { ConfigureNewEftpos } from "./page/configureNewEftpos";
import { TableNumber } from "./page/tableNumber";
import { useRegister } from "../context/register-context";
// import { SiteMap } from "./page/siteMap";
// import { RestaurantsInSublocality } from "./page/restaurantsInSublocality";
// import { RestaurantsInRoute } from "./page/restaurantsInRoute";
// import { RouteSiteMap } from "./page/routeSiteMap";

// reset scroll position on change of route
// https://stackoverflow.com/a/46868707/11460922
export const history = createBrowserHistory();

history.listen((location, action) => {
  //  history.listen((location, action) => {
  //  if (action === ‘PUSH’) {
  window.scrollTo(0, 0);
  //  }
  //  });
});

const logger = new Logger("Main");

Modal.setAppElement("#root");

// Auth routes
// If new auth path is added, add reference to it inside setAuthRedirectPath function in auth context
export const authRedirectPath = "/auth_redirect";
export const loginPath = "/login";
export const signUpPath = "/signup";
export const signUpConfirmPath = "/signup_confirm";
export const forgotPasswordPath = "/forgot_password";
export const forgotPasswordResetPath = "/forgot_password_reset";
export const newInformationRequiredPath = "/new_information_required";
// export const verifyPhonePath = "/verify_phone";
// export const verifyPhoneConfirmPath = "/verify_phone_confirm";

// export const sitemapsPath = "/sitemaps/s";
// export const routeSitemapPath = "/sitemaps/r";
// export const restaurantsInSublocalityPath = "/l";
// export const restaurantsInRoutePath = "/r";
export const landingPath = "/";
export const registerListPath = "/register_list";
// export const landingBusinessPath = "/business";
// export const betaInvitationPath = "/beta_invitation";
// export const notifyPath = "/notify_launch";
// export const restaurantsPath = "/restaurants";
export const configureNewEftposPath = "/configure_new_eftpos";
export const beginOrderPath = "/begin_order";
export const orderTypePath = "/order_type";
export const tableNumberPath = "/table_number";
export const restaurantPath = "/restaurant";
export const dashboardPath = "/dashboard";
// export const oldDashboardPath = "/old_dashboard";
// export const accountPath = "/account";
// export const ordersPath = "/orders";
// export const paymentPath = "/payment";
// export const profilePath = "/profile";
// export const supportPath = "/support";
// export const favouritesPath = "/favourites";
export const checkoutPath = "/checkout";
// export const rewardsPath = "/rewards";
// export const termsPath = "/terms";
// export const privacyPath = "/privacy_policy";
export const createRestaurantPath = "/create_restaurant";
export const unauthorizedPath = "/unauthorized";

export default () => {
  return (
    <>
      {/* <BetaProvider> */}
      {/* <TabNavProvider> */}
      <Router history={history}>
        <Routes />
        {/* <VerifyPhoneOnLogin /> */}
        {/* <TabNav /> */}
      </Router>
      <ToastContainer />
      {/* </TabNavProvider> */}
      {/* </BetaProvider> */}
    </>
  );
};

const Routes = () => {
  // usePageViews();
  useAuthRedirectURL();
  // useUpdateTabNavOnLocation();
  return (
    <Switch>
      <Route exact path={authRedirectPath} component={AuthRedirect} />
      <Route exact path={loginPath} component={Login} />
      <Route exact path={signUpPath} component={Signup} />
      <Route exact path={signUpConfirmPath} component={SignupConfirm} />
      <Route exact path={forgotPasswordPath} component={ForgotPassword} />
      <Route
        exact
        path={forgotPasswordResetPath}
        component={ForgotPasswordReset}
      />
      <Route
        exact
        path={newInformationRequiredPath}
        component={NewInformationRequired}
      />
      {/* <PrivateRoute exact path={verifyPhonePath} component={VerifyPhone} />
      <PrivateRoute
        exact
        path={verifyPhoneConfirmPath}
        component={VerifyPhoneConfirm}
      /> */}
      {/* <Route exact path={sitemapsPath} component={SiteMap} /> */}
      {/* <Route
        exact
        path={`${sitemapsPath}/:page`}
        component={(props: RouteComponentProps<any>) => (
          <SiteMap
            page={
              typeof Number(props.match.params.page) === "number"
                ? Number(props.match.params.page)
                : 1
            }
          />
        )}
      /> */}
      {/* <Route
        exact
        path={`${routeSitemapPath}/:sublocality`}
        component={(props: RouteComponentProps<any>) => (
          <RouteSiteMap fullSublocality={props.match.params.sublocality} />
        )}
      /> */}
      {/* <Route
        exact
        path={`${routeSitemapPath}/:sublocality/:page`}
        component={(props: RouteComponentProps<any>) => (
          <RouteSiteMap
            fullSublocality={props.match.params.sublocality}
            page={
              typeof Number(props.match.params.page) === "number"
                ? Number(props.match.params.page)
                : 1
            }
          />
        )}
      />
      <Route
        exact
        path={`${restaurantsInSublocalityPath}/:sublocality`}
        component={(props: RouteComponentProps<any>) => (
          <RestaurantsInSublocality
            fullSublocality={props.match.params.sublocality}
          />
        )}
      />
      <Route
        exact
        path={`${restaurantsInRoutePath}/:route`}
        component={(props: RouteComponentProps<any>) => (
          <RestaurantsInRoute fullRoute={props.match.params.route} />
        )}
      /> */}
      {/* <Route
        exact
        path={restaurantsInRoutePath}
        component={RestaurantsInRoute}
      /> */}
      <Route exact path={landingPath} component={Landing} />
      <PrivateRoute exact path={registerListPath} component={RegisterList} />
      {/* <Route exact path={landingBusinessPath} component={LandingBusiness} /> */}
      {/* <Route exact path={betaInvitationPath} component={BetaInvitation} />
      <Route exact path={notifyPath} component={Notify} /> */}
      {/* <Route exact path={restaurantsPath} component={Search} /> */}
      <RegisterPrivateRoute
        exact
        path={configureNewEftposPath}
        component={ConfigureNewEftpos}
      />
      <RegisterPrivateRoute
        exact
        path={beginOrderPath}
        component={BeginOrder}
      />
      <RegisterPrivateRoute exact path={orderTypePath} component={OrderType} />
      <RegisterPrivateRoute
        exact
        path={tableNumberPath}
        component={TableNumber}
      />
      <RegisterPrivateRoute exact path={checkoutPath} component={Checkout} />
      <RegisterPrivateRoute
        exact
        path={`${restaurantPath}/:restaurantId`}
        component={(props: RouteComponentProps<any>) => (
          <Restaurant
            restaurantID={props.match.params.restaurantId}
            {...props}
          />
        )}
      />
      <PrivateRoute
        exact
        path={dashboardPath}
        component={DashboardRestaurantList}
      />
      <AdminOnlyRoute
        exact
        path={`${dashboardPath}/:restaurantID`}
        component={(props: RouteComponentProps<any>) => (
          <Dashboard restaurantID={props.match.params.restaurantID} />
        )}
      />
      {/* <AdminOnlyRoute
        exact
        path={`${oldDashboardPath}/:restaurantID`}
        component={(props: RouteComponentProps<any>) => (
          <OldDashboard restaurantID={props.match.params.restaurantID} />
        )}
      /> */}
      {/* <PrivateRoute exact path={accountPath} component={Account} />
      <PrivateRoute exact path={ordersPath} component={Orders} />
      <PrivateRoute exact path={paymentPath} component={Payment} />
      <PrivateRoute exact path={profilePath} component={Profile} />
      <PrivateRoute exact path={favouritesPath} component={Favourites} /> */}
      {/* <PrivateRoute exact path={rewardsPath} component={Rewards} />
      <Route exact path={termsPath} component={Terms} />
      <Route exact path={privacyPath} component={Privacy} />
      <Route path={supportPath} component={SupportRoute} /> */}
      <Route exact path={unauthorizedPath} component={Unauthorised} />
      <PrivateRoute path={createRestaurantPath} component={CreateRestaurant} />
      {/* <PrivateRoute
            exact
            path="/graph/:restaurantId"
            component={(props: RouteComponentProps<any>) => (
              <Graph restaurantID={props.match.params.restaurantId} />
            )}
          /> */}
      <Route exact path={unauthorizedPath} component={Unauthorised} />
      <Route component={NoMatch} />
    </Switch>
  );
};

export const AdminOnlyRoute: FunctionComponent<PrivateRouteProps> = ({
  component: Component,
  path: Path,
  ...rest
}) => {
  const { isAdmin, status } = useAuth();
  const { user, isLoading } = useUser();

  // Handle other authentication statuses
  if (status !== AuthenticationStatus.SignedIn) {
    return (
      <Route
        {...rest}
        render={(props) => (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )}
      />
    );
  }

  // Assumed signed in from this point onwards
  if (isLoading) {
    return <FullScreenSpinner show={true} text="Loading user" />;
  }

  // not authorized
  if (!isAdmin) {
    return (
      <Route
        {...rest}
        render={(props) => (
          <Redirect
            to={{
              pathname: unauthorizedPath,
              state: { from: props.location },
            }}
          />
        )}
      />
    );
  }

  // Route to original path
  return <Route {...rest} component={Component} />;
};

// // must have "restaurantID" in match
// const ManagerPrivateRoute: FunctionComponent<PrivateRouteProps> = ({
//   component: Component,
//   path: Path,
//   ...rest
// }) => {
//   const { isAdmin, status } = useAuth();
//   const { user, isLoading } = useUser();

//   // Handle other authentication statuses
//   if (status !== AuthenticationStatus.SignedIn) {
//     return (
//       <Route
//         {...rest}
//         render={(props) => (
//           <Redirect
//             to={{
//               pathname: "/login",
//               state: { from: props.location },
//             }}
//           />
//         )}
//       />
//     );
//   }

//   // Assumed signed in from this point onwards
//   if (isLoading) {
//     return <FullScreenSpinner show={true} text="Loading user" />;
//   }

//   const restaurantID = get(rest, "computedMatch.params.restaurantID", "");

//   const restaurant = user!.restaurants.items.find((r) => {
//     return r.id === restaurantID;
//   });

//   // not authorized
//   if (!restaurantID || (!restaurant && !isAdmin)) {
//     return (
//       <Route
//         {...rest}
//         render={(props) => (
//           <Redirect
//             to={{
//               pathname: unauthorizedPath,
//               state: { from: props.location },
//             }}
//           />
//         )}
//       />
//     );
//   }

//   // Route to original path
//   return <Route {...rest} component={Component} />;
// };

const PrivateRoute: FunctionComponent<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { status } = useAuth();
  const { user, isLoading } = useUser();

  // Handle other authentication statuses
  if (status !== AuthenticationStatus.SignedIn) {
    return (
      <Route
        {...rest}
        render={(props) => (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )}
      />
    );
  }

  // Assumed signed in from this point onwards
  if (isLoading) {
    return <FullScreenSpinner show={true} text="Loading user" />;
  }

  if (!user) {
    throw "Signed in but no user found in database";
  }

  // Route to original path
  return <Route {...rest} component={Component} />;
};

interface PrivateRouteProps extends RouteProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}

const RegisterPrivateRoute: FunctionComponent<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { register } = useRegister();

  return register ? (
    <PrivateRoute {...rest} component={Component} />
  ) : (
    <Route
      {...rest}
      render={(props) => (
        <Redirect
          to={{
            pathname: registerListPath,
            state: { from: props.location },
          }}
        />
      )}
    />
  );
};

// const PrivateVerifiedPhoneRoute: FunctionComponent<PrivateVerifiedPhoneRouteProps> = ({
//   component: Component,
//   ...rest
// }) => {
//   const { status } = useAuth();
//   const { user, isLoading } = useUser();

//   // Handle other authentication statuses
//   if (status !== AuthenticationStatus.SignedIn) {
//     return (
//       <Route
//         {...rest}
//         render={(props) => (
//           <Redirect
//             to={{
//               pathname: "/login",
//             }}
//           />
//         )}
//       />
//     );
//   }

//   // Assumed signed in from this point onwards
//   if (isLoading) {
//     return <FullScreenSpinner show={true} text="Loading user" />;
//   }

//   if (!user) {
//     throw "Signed in but no user found in database";
//   }

//   // Redirect to phone verification
//   if (!user.phoneNumber || !user.phoneVerified) {
//     return (
//       <Route
//         {...rest}
//         render={(props) => (
//           <Redirect
//             to={{
//               pathname: "/verify_phone",
//               state: { from: props.location }, // Used to detect if we are coming from checkout page
//             }}
//           />
//         )}
//       />
//     );
//   }

//   // Route to original path
//   return <Route {...rest} render={(props) => <Component {...props} />} />;
// };

// interface PrivateVerifiedPhoneRouteProps extends RouteProps {
//   component:
//     | React.ComponentType<RouteComponentProps<any>>
//     | React.ComponentType<any>;
// }

// const BetaRoute: FunctionComponent<RouteProps> = ({
//   component: Component,
//   ...rest
// }) => {
//   const { codeIsValid } = useBeta();

//   return codeIsValid ? (
//     <Route {...rest} component={Component} />
//   ) : (
//     <Route
//       {...rest}
//       render={props => (
//         <Redirect
//           to={{
//             pathname: notifyPath,
//             state: { from: props.location }
//           }}
//         />
//       )}
//     />
//   );
// };

// const BetaPrivateRoute: FunctionComponent<PrivateRouteProps> = ({
//   component: Component,
//   ...rest
// }) => {
//   const { codeIsValid } = useBeta();

//   return codeIsValid ? (
//     <PrivateRoute {...rest} component={Component} />
//   ) : (
//     <Route
//       {...rest}
//       render={props => (
//         <Redirect
//           to={{
//             pathname: notifyPath,
//             state: { from: props.location }
//           }}
//         />
//       )}
//     />
//   );
// };

// const BetaPrivateVerifiedPhoneRoute: FunctionComponent<
//   PrivateVerifiedPhoneRouteProps
// > = ({ component: Component, ...rest }) => {
//   const { codeIsValid } = useBeta();

//   return codeIsValid ? (
//     <PrivateVerifiedPhoneRoute {...rest} component={Component} />
//   ) : (
//     <Route
//       {...rest}
//       render={props => (
//         <Redirect
//           to={{
//             pathname: notifyPath,
//             state: { from: props.location }
//           }}
//         />
//       )}
//     />
//   );
// };

// const VerifyPhoneOnLogin = withRouter((props: RouteComponentProps) => {
//   let { user: cognitoUser } = useAuth();
//   let { user, skipAddingPhone } = useUser();
//   const [pushed, setPushed] = useState(false);

//   // when user retrieved from DB
//   // and user does not have a verified phone
//   // redirect user to verify phone (or show popup)
//   logger.debug("Checking if user has a verified phone");
//   if (
//     !skipAddingPhone &&
//     !pushed &&
//     user &&
//     (!user.phoneNumber || !user.phoneVerified)
//   ) {
//     logger.debug("Will verify phone");

//     props.history.push("/verify_phone");
//     setPushed(true);
//   }

//   return <></>;
// });
