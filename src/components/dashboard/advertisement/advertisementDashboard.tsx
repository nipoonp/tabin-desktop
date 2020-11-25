import React, { useState } from "react";
import { Logger } from "aws-amplify";
import AdvertisementForm from "./advertisementForm";
import AdvertisementTable from "./advertisementTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_ADVERTISEMENT,
} from "../../../graphql/customQueries";
import { DELETE_ADVERTISEMENT } from "../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import { toast } from "../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";

const logger = new Logger("Advertisement category list");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [
    selectedAdvertisement,
    setSelectedAdvertisement,
  ] = useState<IGET_DASHBOARD_ADVERTISEMENT | null>(null);
  const [newAdvertisement, setNewAdvertisement] = useState<boolean>(false);

  const deleteAdvertisement = useMutation(DELETE_ADVERTISEMENT, {
    update: () => {},
    refetchQueries: props.refetchRestaurant,
  });

  const onSelectAdvertisement = (
    advertisement: IGET_DASHBOARD_ADVERTISEMENT | null
  ) => {
    setNewAdvertisement(false);
    setSelectedAdvertisement(advertisement);
  };

  const onCreateNew = () => {
    setNewAdvertisement(true);
    setSelectedAdvertisement(null);
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    props.restaurant.advertisements.items.forEach((advertisement) => {
      promises.push(
        deleteAdvertisement({
          variables: {
            id: advertisement.id,
          },
        })
      );
    });

    Promise.all(promises)
      .then((values) => {
        toast.success("Advertisement category successfully deleted");
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const onBack = () => {
    setNewAdvertisement(false);
    setSelectedAdvertisement(null);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      {!selectedAdvertisement && !newAdvertisement ? (
        <AdvertisementTable
          restaurant={props.restaurant}
          onSelectAdvertisement={onSelectAdvertisement}
          onCreateNew={onCreateNew}
          onDeleteAll={onDelete}
        />
      ) : (
        <AdvertisementForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedAdvertisement={selectedAdvertisement}
          onAdvertisementActionComplete={onBack}
        />
      )}
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
}
