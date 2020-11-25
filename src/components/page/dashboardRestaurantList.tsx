import React, { useEffect } from "react";
import { isMobile } from "react-device-detect";
import { HomeNav } from "../nav/homeNav";
import { useUser } from "../../context/user-context";
import { H5 } from "../../tabin/components/headings";
import { Space2 } from "../../tabin/components/spaces";
import { Redirect, useHistory } from "react-router-dom";
import { dashboardPath, unauthorizedPath } from "../main";
import { useAuth } from "../../context/auth-context";
import { useListDashboardRestaurantsQuery } from "../../hooks/useListDashboardRestaurantsQuery";
import { FullScreenSpinner } from "../../tabin/components/fullScreenSpinner";

export const DashboardRestaurantList = () => {
  const { user } = useUser();
  // const { isAdmin } = useAuth();
  const history = useHistory();
  const {
    data: restaurants,
    error: restaurantError,
    loading: restaurantLoading,
  } = useListDashboardRestaurantsQuery();

  const onClickRestaurant = (restaurantID: string) => {
    history.push(dashboardPath + `/${restaurantID}`);
  };

  if (restaurantLoading) {
    return <FullScreenSpinner show={true} text="Loading dashboard" />;
  }

  if (restaurantError) {
    return <div>Error! {restaurantError.message}</div>;
  }

  // displays
  // if (user!.restaurants.items.length === 0 && !isAdmin) {
  //   return <Redirect to={{ pathname: unauthorizedPath }} />;
  // }

  // if (user!.restaurants.items.length === 1) {
  //   return (
  //     <Redirect
  //       to={{ pathname: dashboardPath + `/${user!.restaurants.items[0].id}` }}
  //     />
  //   );
  // }

  return (
    <>
      {!isMobile && <HomeNav darkTheme={false} />}
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "24px" }}>
        <H5>Please select a restaurant</H5>
        <Space2 />
        {restaurants &&
          restaurants.map((restaurant) => (
            <div
              onClick={() => onClickRestaurant(restaurant.id)}
              style={{
                height: "50px",
                display: "flex",
                alignItems: "center",
                boxShadow:
                  "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
                borderRadius: "7px",
                marginBottom: "16px",
                padding: "0 32px",
                backgroundColor: "#eeeeee",
                cursor: "pointer",
              }}
            >
              {restaurant.name}
            </div>
          ))}
      </div>
    </>
  );
};
