import React, { useState } from "react";
import { Logger } from "aws-amplify";
import CategoryForm from "./categoryForm";
import CategoryTable from "./categoryTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_CATEGORY,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../../graphql/customQueries";
import { useMutation } from "react-apollo-hooks";
import {
  DELETE_CATEGORY,
  DELETE_CATEGORY_PRODUCT_LINK,
} from "../../dashboardGraphQL";
import { toast } from "../../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";

const logger = new Logger("Product category list");

export default (props: IProps) => {
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<IGET_DASHBOARD_CATEGORY | null>(null);
  const [newCategory, setNewCategory] = useState<boolean>(false);

  const deleteCategory = useMutation(DELETE_CATEGORY, {
    update: (proxy, mutationResult) => {},
    refetchQueries: props.refetchRestaurant,
  });

  const deleteCategoryProductLink = useMutation(DELETE_CATEGORY_PRODUCT_LINK, {
    update: (proxy, mutationResult) => {},
  });

  const onSelectCategory = (category: IGET_DASHBOARD_CATEGORY | null) => {
    setNewCategory(false);
    setSelectedCategory(category);
  };

  const onCreateNew = () => {
    setNewCategory(true);
    setSelectedCategory(null);
  };

  const onDeleteAll = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    props.restaurant.categories.items.forEach((category) => {
      promises.push(
        deleteCategory({
          variables: {
            id: category.id,
          },
        })
      );

      category.products.items.forEach((p) => {
        promises.push(
          deleteCategoryProductLink({
            variables: {
              id: p.id,
            },
          })
        );
      });
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
    setNewCategory(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      {!selectedCategory && !newCategory ? (
        <CategoryTable
          restaurant={props.restaurant}
          onSelectCategory={onSelectCategory}
          onCreateNew={onCreateNew}
          onDeleteAll={onDeleteAll}
        />
      ) : (
        <CategoryForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedCategory={selectedCategory}
          onCategoryActionComplete={onBack}
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
