import React, { useEffect, useState } from "react";
import CategoryDashboard from "../dashboard/menu/category/categoryDashboard";
import ProductDashboard from "../dashboard/menu/product/productDashboard";
import OverviewDashboard from "../dashboard/menu/overview/overviewDashboard";
import ModifierGroupDashboard from "../dashboard/menu/modifierGroup/modifierGroupDashboard";
import ModifierDashboard from "../dashboard/menu/modifier/modifierDashboard";
import { Logger } from "aws-amplify";
import TabMenu2D from "../../tabin/components/tabMenu2D";
import { ITab } from "../../tabin/components/tabMenu2D";
import { useUser } from "../../context/user-context";
import { Redirect } from "react-router-dom";
import OperatingHours from "../dashboard/operatingHours/operatingHours";
import Register from "../dashboard/register/registerDashboard";
import Advertisement from "../dashboard/advertisement/advertisementDashboard";
// import DiscountDashboard from "../dashboard/discount/discountDashboard";
import { useGetDashboardRestaurantQuery } from "../../hooks/useGetDashboardRestaurantQuery";
import // LIST_MODIFIER_GROUPS_BY_RESTAURANT,
// STRIPE_VERIFY_INFORMATION,
"../dashboard/dashboardGraphQL";
import {
  GET_DASHBOARD_RESTAURANT,
  // ILIST_DAILY_SALES
} from "../../graphql/customQueries";
import { useAuth } from "../../context/auth-context";
import { FullScreenSpinner } from "../../tabin/components/fullScreenSpinner";
// import { useListDailySalesQuery } from "../../hooks/useListDailySales";
// import { eachDayOfInterval, format, subDays } from "date-fns";
// import { Space, Space3, Space2 } from "../../tabin/components/spaces";
// import { Title1Font, BoldFont } from "../../tabin/components/fonts";
// import { DateRangePicker } from "../../tabin/components/dateRangePicker";
// import { ButtonV2 } from "../../tabin/components/buttonv2";
// import { useMutation } from "react-apollo-hooks";
// import { toast } from "../../tabin/components/toast";
// import { BarChartIcon } from "../../tabin/components/barChartIcon";
// import { CreditCardIcon } from "../../tabin/components/creditCardIcon";
// import { PercentIcon } from "../../tabin/components/percentIcon";
import { ClockIcon } from "../../tabin/components/clockIcon";
import { BookIcon } from "../../tabin/components/bookIcon";
import { ImportExportMenu } from "../dashboard/menu/importExport/importExportMenu";
// import { ImportExportMenu } from "../dashboard/menu/overview/importExportMenu";

const logger = new Logger("Dashboard");

export default (props: { restaurantID: string }) => {
  const { user } = useUser();
  const { isAdmin } = useAuth();

  const isRestaurantManager = user!.restaurants.items.find((r) => {
    return r.id === props.restaurantID;
  })
    ? true
    : false;

  return isRestaurantManager || isAdmin ? (
    <Dashboard {...props} />
  ) : (
    <Redirect to={{ pathname: "/unauthorized" }} />
  );
};

export const Dashboard = (props: { restaurantID: string }) => {
  const { isAdmin } = useAuth();
  const {
    data: restaurant,
    error: restaurantError,
    loading: restaurantLoading,
  } = useGetDashboardRestaurantQuery(props.restaurantID);

  // const {
  //   data: modifierGroups,
  //   error: modifierGroupsError,
  //   loading: modifierGroupsLoading,
  // } = useListModifierGroupsByRestaurant(props.restaurantID);

  // const { user } = useUser();

  // const {
  //   sales: restaurantSales,
  //   error: restaurantSalesError,
  //   loading: restaurantSalesLoading,
  //   refetch: refetchSales,
  //   refetching: refetchingRestaurantSales,
  // } = useListDailySalesQuery(
  //   props.restaurantID,
  //   format(subDays(new Date(), 7), "yyyy-MM-dd"),
  //   format(new Date(), "yyyy-MM-dd")
  // );

  // const stripeVerifyInformation = useMutation(STRIPE_VERIFY_INFORMATION);

  // const [salesSummaryStartDate, setSalesSummaryStartDate] = useState<
  //   string | null
  // >(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  // const [salesSummaryEndDate, setSalesSummaryEndDate] = useState<string | null>(
  //   format(new Date(), "yyyy-MM-dd")
  // );
  // const [showFullScreenSpinner, showShowFullScreenSpinner] = useState(false);

  if (restaurantLoading) {
    return <FullScreenSpinner show={true} text="Loading dashboard" />;
  }

  if (restaurantError) {
    return <div>Error! {restaurantError.message}</div>;
  }

  // if (restaurantSalesLoading || refetchingRestaurantSales) {
  //   return <FullScreenSpinner show={true} text="Loading sales summary" />;
  // }

  // if (restaurantSalesError) {
  //   return <div>Error! {restaurantSalesError.message}</div>;
  // }

  // if (modifierGroupsLoading) {
  //   return <FullScreenSpinner show={true} text="Loading modifier groups" />;
  // }

  // if (modifierGroupsError) {
  //   return (
  //     <>
  //       <div>Error! {modifierGroupsError.message}</div>
  //     </>
  //   );
  // }

  // if (!restaurant || !restaurantSales || !modifierGroups) {
  //   throw "No data when not loading and no error.";
  // }

  // if (!restaurant || !modifierGroups) {
  if (!restaurant) {
    throw "No data when not loading and no error.";
  }

  // const refetchRestaurantSales = async (
  //   startDate: string | null,
  //   endDate: string | null
  // ) => {
  //   setSalesSummaryStartDate(startDate);
  //   setSalesSummaryEndDate(endDate);
  //   if (startDate && endDate) {
  //     await refetchSales({
  //       restaurantID: props.restaurantID,
  //       startDate: startDate,
  //       endDate: endDate,
  //     });
  //   }
  // };

  // const onStripeVerifyInformation = async () => {
  //   showShowFullScreenSpinner(true);
  //   try {
  //     const response = await stripeVerifyInformation({
  //       variables: {
  //         restaurantID: props.restaurantID,
  //         successURL: window.location.href,
  //         failureURL: window.location.href,
  //       },
  //     });

  //     const link = response.data.stripeVerifyInformation.link;

  //     logger.debug("link", link);
  //     window.location.assign(link);
  //   } catch (e) {
  //     logger.debug("error", e);
  //     toast.error(
  //       "There was an error processing your request. Please contact a Tabin representative."
  //     );
  //   } finally {
  //     showShowFullScreenSpinner(false);
  //   }
  // };

  const refetchRestaurant = [
    {
      query: GET_DASHBOARD_RESTAURANT,
      variables: { restaurantID: props.restaurantID },
    },
  ];

  const defaultTab = isAdmin ? "menu" : "salesSummary";
  const defaultSubTab = isAdmin ? "overview" : "salesSummary";

  const tabsAdmin: ITab[] = [
    {
      id: "menu",
      name: "Menu",
      icon: <BookIcon height="20px" />,
      subTabs: [
        {
          id: "importExportMenu",
          name: "Import/Export",
          component: <ImportExportMenu restaurant={restaurant} />,
        },
        {
          id: "overview",
          name: "Overview",
          component: (
            <OverviewDashboard
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
        {
          id: "categories",
          name: "Categories",
          component: (
            <CategoryDashboard
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
        {
          id: "products",
          name: "Products",
          component: (
            <ProductDashboard
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
        {
          id: "modifierGroups",
          name: "Modifier Groups",
          component: (
            <ModifierGroupDashboard
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
              // modifierGroups={modifierGroups}
            />
          ),
        },
        {
          id: "modifier",
          name: "Modifier",
          component: (
            <ModifierDashboard
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
              // modifierGroups={modifierGroups}
            />
          ),
        },
      ],
    },
    {
      id: "registers",
      name: "Registers",
      icon: <ClockIcon height="20px" />,
      subTabs: [
        {
          id: "registers",
          name: "Registers",
          component: (
            <Register
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
      ],
    },
    {
      id: "advertisements",
      name: "Advertisements",
      icon: <ClockIcon height="20px" />,
      subTabs: [
        {
          id: "advertisements",
          name: "Advertisements",
          component: (
            <Advertisement
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
      ],
    },
    {
      id: "operatingHours",
      name: "Operating Hours",
      icon: <ClockIcon height="20px" />,
      subTabs: [
        {
          id: "operatingHours",
          name: "OperatingHours",
          component: (
            <OperatingHours
              restaurant={restaurant}
              refetchRestaurant={refetchRestaurant}
            />
          ),
        },
      ],
    },
    // {
    //   id: "salesSummary",
    //   name: "Sales Summary",
    //   icon: <BarChartIcon height="20px" />,
    //   subTabs: [
    //     {
    //       id: "salesSummary",
    //       name: "SalesSummary",
    //       component: (
    //         <SalesSummary
    //           salesSummaryStartDate={salesSummaryStartDate}
    //           salesSummaryEndDate={salesSummaryEndDate}
    //           restaurantSales={restaurantSales}
    //           refetchRestaurantSales={refetchRestaurantSales}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   id: "paymentDetails",
    //   name: "Payment Details",
    //   icon: <CreditCardIcon height="20px" />,
    //   subTabs: [
    //     {
    //       id: "paymentDetails",
    //       name: "PaymentDetails",
    //       component: (
    //         <PaymentDetails
    //           stripeInformationNeeded={false}
    //           stripePendingVerification={false}
    //           onStripeVerifyInformation={onStripeVerifyInformation}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   id: "discount",
    //   name: "Discounts",
    //   icon: <PercentIcon height="20px" />,
    //   subTabs: [
    //     {
    //       id: "discount",
    //       name: "Discount",
    //       component: <DiscountDashboard restaurant={restaurant} />,
    //     },
    //   ],
    // },
  ];

  const tabs: ITab[] = [
    // {
    //   id: "salesSummary",
    //   name: "Sales Summary",
    //   icon: <BarChartIcon height="20px" />,
    //   subTabs: [
    //     {
    //       id: "salesSummary",
    //       name: "SalesSummary",
    //       component: (
    //         <SalesSummary
    //           salesSummaryStartDate={salesSummaryStartDate}
    //           salesSummaryEndDate={salesSummaryEndDate}
    //           restaurantSales={restaurantSales}
    //           refetchRestaurantSales={refetchRestaurantSales}
    //         />
    //       ),
    //     },
    //   ],
    // },
    // {
    //   id: "paymentDetails",
    //   name: "Payment Details",
    //   icon: <CreditCardIcon height="20px" />,
    //   subTabs: [
    //     {
    //       id: "paymentDetails",
    //       name: "PaymentDetails",
    //       component: (
    //         <PaymentDetails
    //           stripeInformationNeeded={false}
    //           stripePendingVerification={false}
    //           onStripeVerifyInformation={onStripeVerifyInformation}
    //         />
    //       ),
    //     },
    //   ],
    // },
  ];

  return (
    <>
      {/* <FullScreenSpinner show={showFullScreenSpinner} text="Loading..." /> */}
      <TabMenu2D
        tabs={isAdmin ? tabsAdmin : tabs}
        defaultTab={defaultTab}
        defaultSubTab={defaultSubTab}
      />
    </>
  );
};

// const SalesSummary = (props: {
//   salesSummaryStartDate: string | null;
//   salesSummaryEndDate: string | null;
//   restaurantSales: ILIST_DAILY_SALES[];
//   refetchRestaurantSales: (
//     startDate: string | null,
//     endDate: string | null
//   ) => void;
// }) => {
//   const [focusedInput, setFocusedInput] = useState<
//     "startDate" | "endDate" | null
//   >(null);
//   const [salesArray, setSalesArray] = useState<ILIST_DAILY_SALES[]>([]);

//   useEffect(() => {
//     if (props.salesSummaryStartDate && props.salesSummaryEndDate) {
//       let dateArray = eachDayOfInterval({
//         start: new Date(props.salesSummaryStartDate),
//         end: new Date(props.salesSummaryEndDate),
//       });

//       let initialSalesArray = dateArray.map((d) => {
//         return {
//           date: format(d, "yyyy-MM-dd"),
//           total: 0,
//           numberOfOrders: 0,
//           restaurantDiscountAmount: 0,
//           applicationFees: 0,
//           transferAmount: 0,
//         };
//       });

//       const salesArrayX = initialSalesArray.map((d) => {
//         let value = props.restaurantSales.filter((v: ILIST_DAILY_SALES) => {
//           return v.date == d.date;
//         })[0];

//         return (
//           value || {
//             date: d.date,
//             total: 0,
//             numberOfOrders: 0,
//             restaurantDiscountAmount: 0,
//             applicationFees: 0,
//             transferAmount: 0,
//           }
//         );
//       });

//       setSalesArray(salesArrayX);
//     }
//   }, [props.restaurantSales]);

//   const onDatesChange = async (startD: string | null, endD: string | null) => {
//     props.refetchRestaurantSales(startD, endD);
//   };

//   const onFocusChange = (focusedInput: "startDate" | "endDate" | null) => {
//     setFocusedInput(focusedInput);
//   };

//   // logger.debug("xxx...rerender", salesArray);

//   return (
//     <>
//       <div
//         style={{
//           backgroundColor: "white",
//           padding: "32px",
//           borderRadius: "10px",
//           boxShadow: "rgba(0, 0, 0, 0.02) 10px 10px 10px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "32px",
//           }}
//         >
//           <Title1Font>Sales Summary</Title1Font>
//         </div>
//         <div style={{ display: "flex", justifyContent: "center" }}>
//           <DateRangePicker
//             startDate={props.salesSummaryStartDate}
//             endDate={props.salesSummaryEndDate}
//             onDatesChange={onDatesChange}
//             focusedInput={focusedInput}
//             onFocusChange={onFocusChange}
//           />
//         </div>

//         {props.salesSummaryStartDate && props.salesSummaryEndDate ? (
//           <>
//             {salesArray.length === 0 ? (
//               <>
//                 <Space3 />
//                 <div>No sales between the selected dates.</div>
//               </>
//             ) : (
//               <>
//                 {/* <Space size={36} />
//                 <SalesSummaryGraph sales={salesArray} />
//                 <Space size={50} />
//                 <SalesSummaryTable sales={salesArray} /> */}
//               </>
//             )}
//           </>
//         ) : (
//           <>
//             <Space3 />
//             <div>Please select the start and end date</div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export const PaymentDetails = (props: {
//   stripeInformationNeeded: boolean;
//   stripePendingVerification: boolean;
//   onStripeVerifyInformation: () => void;
// }) => {
//   return (
//     <>
//       <div
//         style={{
//           backgroundColor: "white",
//           padding: "32px",
//           borderRadius: "10px",
//           boxShadow: "rgba(0, 0, 0, 0.02) 10px 10px 10px",
//         }}
//       >
//         <Title1Font>Bank Account Details</Title1Font>
//         {props.stripePendingVerification && (
//           <>
//             <Space3 />
//             <div>Bank Account details pending verification.</div>
//           </>
//         )}
//         {props.stripeInformationNeeded && (
//           <>
//             <Space3 />
//             <div>Payment details are not currently set up.</div>
//             <Space3 />
//             <BoldFont>
//               <ButtonV2
//                 style={{ width: "85px", padding: "10px" }}
//                 onClick={props.onStripeVerifyInformation}
//               >
//                 SET UP
//               </ButtonV2>
//             </BoldFont>
//           </>
//         )}
//       </div>
//     </>
//   );
// };
