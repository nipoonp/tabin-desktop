import React, { useState } from "react";
import { useMutation } from "react-apollo-hooks";
import OverviewDraggableProductCategories from "./overviewDraggableProductCategories";
import {
  UPDATE_CATEGORY_PRODUCT_LINK_DISPLAY_SEQUENCE,
  UPDATE_PRODUCT_MODIFIER_GROUP_LINK_DISPLAY_SEQUENCE,
  UPDATE_MODIFIER_GROUP_MODIFIER_LINK_DISPLAY_SEQUENCE,
  UPDATE_CATEGORY_DISPLAY_SEQUENCE,
} from "../../dashboardGraphQL";
import { Logger } from "aws-amplify";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../../tabin/components/toast";
import { Button } from "../../../../tabin/components/button";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_CATEGORY,
  IGET_DASHBOARD_PRODUCT,
  IGET_DASHBOARD_PRODUCTS,
  IGET_DASHBOARD_MODIFIER_GROUPS,
  IGET_DASHBOARD_MODIFIERS,
} from "../../../../graphql/customQueries";
import { H4 } from "../../../../tabin/components/headings";

const logger = new Logger("Overview");
const styles = require("./overviewDashboard.module.css");

const formatRestaurantData = (props: IProps) => {
  let draggableProductCategories: IDraggableProductCategories[] = [];
  let draggableProducts: IDraggableProducts[] = [];
  let draggableModifierGroups: IDraggableModifierGroups[] = [];
  let draggableModifiers: IDraggableModifiers[] = [];

  props.restaurant.categories.items.map((c: IGET_DASHBOARD_CATEGORY) => {
    draggableProducts = [];

    c.products.items.map((p: IGET_DASHBOARD_PRODUCTS) => {
      draggableModifierGroups = [];

      p.product.modifierGroups.items.map(
        (mg: IGET_DASHBOARD_MODIFIER_GROUPS) => {
          draggableModifiers = [];

          mg.modifierGroup.modifiers.items.map((m: IGET_DASHBOARD_MODIFIERS) =>
            draggableModifiers.push({
              id: m.id,
              content: `${m.modifier.name} (${m.displaySequence})`,
              displaySequence: m.displaySequence,
            })
          );

          draggableModifierGroups.push({
            id: mg.id,
            content: `${mg.modifierGroup.name} (${mg.id}) (${mg.displaySequence})`,
            displaySequence: mg.displaySequence,
            modifiers: draggableModifiers,
          });
        }
      );

      draggableProducts.push({
        id: p.id,
        content: `${p.product.name} (${p.displaySequence})`,
        displaySequence: p.displaySequence,
        modifierGroups: draggableModifierGroups,
      });
    });

    draggableProductCategories.push({
      id: c.id,
      content: `${c.name} (${c.displaySequence})`,
      displaySequence: c.displaySequence,
      products: draggableProducts,
    });
  });

  return draggableProductCategories;
};

export default (props: IProps) => {
  const [productCategories, setProductCategories] = useState(
    formatRestaurantData(props)
  );

  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const updateCategoryDisplaySequence = useMutation(
    UPDATE_CATEGORY_DISPLAY_SEQUENCE,
    {
      update: (proxy, mutationResult) => {},
      refetchQueries: props.refetchRestaurant,
    }
  );

  const updateCategoryProductLinkDisplaySequence = useMutation(
    UPDATE_CATEGORY_PRODUCT_LINK_DISPLAY_SEQUENCE,
    {
      update: (proxy, mutationResult) => {},
      refetchQueries: props.refetchRestaurant,
    }
  );

  const updateProductModifierGroupLinkDisplaySequence = useMutation(
    UPDATE_PRODUCT_MODIFIER_GROUP_LINK_DISPLAY_SEQUENCE,
    {
      update: (proxy, mutationResult) => {},
      refetchQueries: props.refetchRestaurant,
    }
  );

  const updateModifierGroupModifierLinkDisplaySequence = useMutation(
    UPDATE_MODIFIER_GROUP_MODIFIER_LINK_DISPLAY_SEQUENCE,
    {
      update: (proxy, mutationResult) => {},
      refetchQueries: props.refetchRestaurant,
    }
  );

  const onSetProductCategories = (
    productCategories: IDraggableProductCategories[]
  ) => {
    setProductCategories(productCategories);
  };

  const onSubmit = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    for (var i = 0; i < productCategories.length; i++) {
      let currNewCategory = productCategories[i];

      if (currNewCategory.displaySequence != i) {
        promises.push(
          updateCategoryDisplaySequence({
            variables: {
              id: currNewCategory.id,
              displaySequence: i,
            },
          })
        );
      }

      for (var j = 0; j < currNewCategory.products.length; j++) {
        let currNewProduct = currNewCategory.products[j];

        if (currNewProduct.displaySequence != j) {
          logger.debug(currNewProduct);
          promises.push(
            updateCategoryProductLinkDisplaySequence({
              variables: {
                id: currNewProduct.id,
                displaySequence: j,
              },
            })
          );
        }

        for (var k = 0; k < currNewProduct.modifierGroups.length; k++) {
          let currNewModifierGroup = currNewProduct.modifierGroups[k];

          if (currNewModifierGroup.displaySequence != k) {
            logger.debug(currNewModifierGroup);
            promises.push(
              updateProductModifierGroupLinkDisplaySequence({
                variables: {
                  id: currNewModifierGroup.id,
                  displaySequence: k,
                },
              })
            );
          }

          for (var l = 0; l < currNewModifierGroup.modifiers.length; l++) {
            let currNewModifier = currNewModifierGroup.modifiers[l];

            if (currNewModifier.displaySequence != l) {
              logger.debug(currNewModifier);
              promises.push(
                updateModifierGroupModifierLinkDisplaySequence({
                  variables: {
                    id: currNewModifier.id,
                    displaySequence: l,
                  },
                })
              );
            }
          }
        }
      }
    }

    Promise.all(promises)
      .then((values) => toast.success("Products successfully updated"))
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <div className={styles.dashboardHeader}>
        <H4>Overview</H4>
        <Button className={styles.button} onClick={onSubmit}>
          Save
        </Button>
      </div>
      {productCategories.length > 0 ? (
        <>
          <OverviewDraggableProductCategories
            productCategories={productCategories}
            setProductCategories={onSetProductCategories}
          />
        </>
      ) : (
        <div>Please add some products</div>
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

export interface IDraggableProductCategories {
  id: string;
  content: string;
  displaySequence: number;
  products: IDraggableProducts[];
}

export interface IDraggableProducts {
  id: string;
  content: string;
  displaySequence: number;
  modifierGroups: IDraggableModifierGroups[];
}

export interface IDraggableModifierGroups {
  id: string;
  content: string;
  displaySequence: number;
  modifiers: IDraggableModifiers[];
}

export interface IDraggableModifiers {
  id: string;
  content: string;
  displaySequence: number;
}
