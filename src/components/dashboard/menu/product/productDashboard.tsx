import React, { useState } from "react";
import { Logger } from "aws-amplify";
import ProductForm from "./productForm";
import ProductTable from "./productTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_PRODUCT,
} from "../../../../graphql/customQueries";
import {
  DELETE_CATEGORY_PRODUCT_LINK,
  DELETE_PRODUCT_MODIFIER_GROUP_LINK,
  DELETE_PRODUCT,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import { toast } from "../../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";

const logger = new Logger("Product category list");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<IGET_DASHBOARD_PRODUCT | null>(null);
  const [newProduct, setNewProduct] = useState<boolean>(false);

  const deleteCategoryProductLink = useMutation(DELETE_CATEGORY_PRODUCT_LINK, {
    update: (proxy, mutationResult) => {},
  });

  const deleteProductModifierGroupLink = useMutation(
    DELETE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const deleteProduct = useMutation(DELETE_PRODUCT, {
    update: () => {},
    refetchQueries: props.refetchRestaurant,
  });

  const onSelectProduct = (product: IGET_DASHBOARD_PRODUCT | null) => {
    setNewProduct(false);
    setSelectedProduct(product);
  };

  const onCreateNew = () => {
    setNewProduct(true);
    setSelectedProduct(null);
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    props.restaurant.products.items.forEach((product) => {
      product.categories.items.forEach((cpLink) => {
        promises.push(
          deleteCategoryProductLink({
            variables: {
              id: cpLink.id,
            },
          })
        );
      });
    });

    props.restaurant.products.items.forEach((product) => {
      product.modifierGroups.items.forEach((pmgLink) => {
        promises.push(
          deleteProductModifierGroupLink({
            variables: {
              id: pmgLink.id,
            },
          })
        );
      });
    });

    props.restaurant.products.items.forEach((product) => {
      promises.push(
        deleteProduct({
          variables: {
            id: product.id,
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
    setNewProduct(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      {!selectedProduct && !newProduct ? (
        <ProductTable
          restaurant={props.restaurant}
          onSelectProduct={onSelectProduct}
          onCreateNew={onCreateNew}
          onDeleteAll={onDelete}
        />
      ) : (
        <ProductForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedProduct={selectedProduct}
          onProductActionComplete={onBack}
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
