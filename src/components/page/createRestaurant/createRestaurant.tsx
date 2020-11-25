import React, { FunctionComponent } from "react";
import Admin from "./admin";
import General from "./general";
import Photos from "./photos";
import OperatingHours from "./operatingHours";
import Address from "./address";
import Location from "./location";
import {
  Route,
  Switch,
  RouteProps,
  RouteComponentProps,
  Redirect
} from "react-router-dom";
import Summary from "./summary";
import GetBackToYou from "./getBackToYou";
import { NoMatch } from "../error/404";
import { CreateRestaurantProvider } from "../../../context/createRestaurant-context";
import { useAuth } from "../../../context/auth-context";
import { Logger } from "aws-amplify";
import { unauthorizedPath, AdminOnlyRoute } from "../../main";

const logger = new Logger("createRestaurant");

export const createRestaurantAdminRoute = "/create_restaurant/admin";
export const createRestaurantGeneralRoute = "/create_restaurant/general";
export const createRestaurantAddressRoute = "/create_restaurant/address";
export const createRestaurantLocationRoute = "/create_restaurant/location";
export const createRestaurantPhotosRoute = "/create_restaurant/photos";
export const createRestaurantOperatingHoursRoute =
  "/create_restaurant/operating_hours";
export const createRestaurantSummaryRoute = "/create_restaurant/summary";
export const createRestaurantGetBackToYouRoute =
  "/create_restaurant/get_back_to_you";

export default () => {
  return (
    <>
      <CreateRestaurantProvider>
        <Switch>
          <AdminOnlyRoute
            exact
            path={createRestaurantAdminRoute}
            component={Admin}
          />
          <Route
            exact
            path={createRestaurantGeneralRoute}
            component={General}
          />
          <Route
            exact
            path={createRestaurantAddressRoute}
            component={Address}
          />
          <Route
            exact
            path={createRestaurantLocationRoute}
            component={Location}
          />
          <Route exact path={createRestaurantPhotosRoute} component={Photos} />
          <Route
            exact
            path={createRestaurantOperatingHoursRoute}
            component={OperatingHours}
          />
          <Route
            exact
            path={createRestaurantSummaryRoute}
            component={Summary}
          />
          <Route
            exact
            path={createRestaurantGetBackToYouRoute}
            component={GetBackToYou}
          />
          <Route component={NoMatch} />
        </Switch>
      </CreateRestaurantProvider>
    </>
  );
};
