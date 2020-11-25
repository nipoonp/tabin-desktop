import React, { useState, useEffect } from "react";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  DELETE_CATEGORY_PRODUCT_LINK,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import { Button } from "../../../../tabin/components/button";
import * as yup from "yup";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../../tabin/components/toast";
import Input from "../../../../tabin/components/input";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import { Logger } from "aws-amplify";
import DashboardHeaderEdit from "../../dashboardHeaderEdit";
import ImagePicker from "../../../../tabin/components/imagePicker";
import FormFieldSeparator from "../../formFieldSeparator";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_CATEGORY,
  IGET_DASHBOARD_PRODUCT,
  IGET_DASHBOARD_PRODUCTS,
  IGET_DASHBOARD_MODIFIER_GROUPS,
  IS3Image,
} from "../../../../graphql/customQueries";

const logger = new Logger("CategoryForm");

const nameSchema = yup.string().required("Required");

export default (props: IProps) => {
  let isMounted = false;

  useEffect(() => {
    isMounted = true;

    // returned function will be called on component unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const { selectedCategory } = props;
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedCategory ? selectedCategory.name : ""
  );
  const [image, setImage] = useState<IS3Image | null>(null);

  const [nameError, setNameError] = useState("");

  const createCategory = useMutation(CREATE_CATEGORY, {
    update: (proxy, mutationResult) => {
      toast.success("New category successfully added");
      props.onCategoryActionComplete();

      if (isMounted) {
        setShowFullScreenSpinner(false);
      }
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateCategory = useMutation(UPDATE_CATEGORY, {
    update: (proxy, mutationResult) => {
      toast.success("Category successfully updated");
      props.onCategoryActionComplete();

      if (isMounted) {
        setShowFullScreenSpinner(false);
      }
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteCategory = useMutation(DELETE_CATEGORY, {
    update: (proxy, mutationResult) => {},
    refetchQueries: props.refetchRestaurant,
  });

  const deleteCategoryProductLink = useMutation(DELETE_CATEGORY_PRODUCT_LINK, {
    update: (proxy, mutationResult) => {},
  });

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedCategory) {
      props.selectedCategory.products.items.map(
        (p: IGET_DASHBOARD_PRODUCTS) => {
          deleteCategoryProductLink({
            variables: {
              id: p.id,
            },
          });
        }
      );

      promises.push(
        deleteCategory({
          variables: {
            id: props.selectedCategory.id,
          },
        })
      );
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("Product category successfully deleted");
        props.onCategoryActionComplete();
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const onSubmit = () => {
    setShowFullScreenSpinner(true);

    validateAllFields()
      .then(() => {
        let variables = {
          id: "Placeholder",
          categoryRestaurantId: props.restaurant.id,
          name: name,
          image: image,
          displaySequence: 999,
          owner: props.restaurant.restaurantManagerId,
        };

        if (props.selectedCategory) {
          variables.id = props.selectedCategory.id;
          delete variables.categoryRestaurantId;
          delete variables.owner;

          updateCategory({ variables: variables });
        } else {
          delete variables.id;

          if (!image) {
            delete variables.image;
          }

          createCategory({ variables: variables });
        }
      })
      .catch(() => setShowFullScreenSpinner(false));
  };

  const validateAllFields = () => {
    validateName();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onSetImage = (uploadedImage: IS3Image | null) => {
    setImage(uploadedImage);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onCategoryActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedCategory ? true : false}
      />
      {/* <form onSubmit={onSubmit}*/}
      <Input
        title="Category"
        name="name"
        autoFocus={true}
        placeholder="Enter category name"
        value={name}
        onChange={onChangeName}
        onBlur={validateName}
        error={nameError}
      />
      <FormFieldSeparator />
      <ImagePicker uploadedImage={image} setUploadedImage={onSetImage} />
      {/* </form> */}
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
  selectedCategory: IGET_DASHBOARD_CATEGORY | null;
  onCategoryActionComplete: () => void;
}
