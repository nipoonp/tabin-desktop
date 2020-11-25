import React, { useState } from "react";
import { Logger } from "aws-amplify";
import ModifierForm from "./modifierForm";
import ModifierTable from "./modifierTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_MODIFIER,
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_MODIFIER_GROUP,
} from "../../../../graphql/customQueries";
import { toast } from "../../../../tabin/components/toast";
import {
  DELETE_MODIFIER,
  DELETE_MODIFIER_GROUP_MODIFIER_LINK,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";

const logger = new Logger("ModifierDashboard");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [
    selectedModifier,
    setSelectedModifier,
  ] = useState<IGET_DASHBOARD_MODIFIER | null>(null);
  const [newModifier, setNewModifier] = useState<boolean>(false);

  const deleteModifierGroupModifierLink = useMutation(
    DELETE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const deleteModifier = useMutation(DELETE_MODIFIER, {
    update: (proxy, mutationResult) => {},
    refetchQueries: props.refetchRestaurant,
  });

  const onSelectModifier = (modifier: IGET_DASHBOARD_MODIFIER | null) => {
    setNewModifier(false);
    setSelectedModifier(modifier);
  };

  const onCreateNew = () => {
    setNewModifier(true);
    setSelectedModifier(null);
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    props.restaurant.modifiers.items.forEach((modifier) => {
      modifier.modifierGroups.items.forEach((mgmLink) => {
        promises.push(
          deleteModifierGroupModifierLink({
            variables: {
              id: mgmLink.id,
            },
          })
        );
      });
    });

    props.restaurant.modifiers.items.forEach((modifier) => {
      promises.push(
        deleteModifier({
          variables: {
            id: modifier.id,
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
    setNewModifier(false);
    setSelectedModifier(null);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      {!selectedModifier && !newModifier ? (
        <ModifierTable
          restaurant={props.restaurant}
          onSelectModifier={onSelectModifier}
          onCreateNew={onCreateNew}
          onDeleteAll={onDelete}
        />
      ) : (
        <ModifierForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedModifier={selectedModifier}
          onModifierActionComplete={onBack}
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
