import React, { useState } from "react";
import { Logger } from "aws-amplify";
import ModifierGroupForm from "./modifierGroupForm";
// import { IRestaurant, IModifierGroup } from "../../../../model/model";
import ModifierGroupTable from "./modifierGroupTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_MODIFIER_GROUP,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../../graphql/customQueries";
import {
  CREATE_PRODUCT_MODIFIER_GROUP_LINK,
  DELETE_PRODUCT_MODIFIER_GROUP_LINK,
  DELETE_MODIFIER_GROUP_MODIFIER_LINK,
  DELETE_MODIFIER_GROUP,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import { toast } from "../../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";

const logger = new Logger("Modifier Group list");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [
    selectedModifierGroup,
    setSelectedModifierGroup,
  ] = useState<IGET_DASHBOARD_MODIFIER_GROUP | null>(null);
  const [newModifierGroup, setNewModifierGroup] = useState<boolean>(false);

  const deleteProductModifierGroupLink = useMutation(
    DELETE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const deleteModifierGroupModifierLink = useMutation(
    DELETE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const deleteModifierGroup = useMutation(DELETE_MODIFIER_GROUP, {
    update: (proxy, mutationResult) => {},
    refetchQueries: props.refetchRestaurant,
  });

  const onSelectModifierGroup = (
    modifierGroup: IGET_DASHBOARD_MODIFIER_GROUP | null
  ) => {
    setNewModifierGroup(false);
    setSelectedModifierGroup(modifierGroup);
  };

  const onCreateNew = () => {
    setNewModifierGroup(true);
    setSelectedModifierGroup(null);
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    props.restaurant.modifierGroups.items.forEach((modifierGroup) => {
      modifierGroup.products.items.forEach((pmgLink) => {
        promises.push(
          deleteProductModifierGroupLink({
            variables: {
              id: pmgLink.id,
            },
          })
        );
      });
    });

    props.restaurant.modifierGroups.items.forEach((modifierGroup) => {
      modifierGroup.modifiers.items.forEach((mgmLink) => {
        promises.push(
          deleteModifierGroupModifierLink({
            variables: {
              id: mgmLink.id,
            },
          })
        );
      });
    });

    props.restaurant.modifierGroups.items.forEach((modifierGroup) => {
      promises.push(
        deleteModifierGroup({
          variables: {
            id: modifierGroup.id,
          },
        })
      );
    });

    Promise.all(promises)
      .then((values) => {
        toast.success("Product category successfully deleted");
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const onBack = () => {
    setNewModifierGroup(false);
    setSelectedModifierGroup(null);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      {!selectedModifierGroup && !newModifierGroup ? (
        <ModifierGroupTable
          restaurant={props.restaurant}
          onSelectModifierGroup={onSelectModifierGroup}
          onCreateNew={onCreateNew}
          onDeleteAll={onDelete}
        />
      ) : (
        <ModifierGroupForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedModifierGroup={selectedModifierGroup}
          onModifierGroupActionComplete={onBack}
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
