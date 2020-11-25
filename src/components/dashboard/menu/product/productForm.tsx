import React, { useState, useEffect } from "react";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  DELETE_PRODUCT_MODIFIER_GROUP_LINK,
  DELETE_CATEGORY_PRODUCT_LINK,
  CREATE_CATEGORY_PRODUCT_LINK,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import Input from "../../../../tabin/components/input";
import { TextArea } from "../../../../tabin/components/textArea";
import Select from "../../../../tabin/components/select";
import * as yup from "yup";
import { Logger } from "aws-amplify";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import {
  convertDollarsToCents,
  convertCentsToDollars,
} from "../../../../util/moneyConversion";
import ImagePicker from "../../../../tabin/components/imagePicker";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import DashboardHeaderEdit from "../../dashboardHeaderEdit";
import FormFieldSeparator from "../../formFieldSeparator";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_PRODUCT,
  IS3Image,
} from "../../../../graphql/customQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/fontawesome-free-solid";

const styles = require("./productDashboard.module.css");

const logger = new Logger("ProductForm");

const nameSchema = yup.string().required("Required");
const priceSchema = yup.string().required("Required");

export default (props: IProps) => {
  const { selectedProduct } = props;
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(selectedProduct ? selectedProduct.name : "");
  const [description, setDescription] = useState(
    selectedProduct ? selectedProduct.description : ""
  );
  const [price, setPrice] = useState(
    selectedProduct ? convertCentsToDollars(selectedProduct.price) : ""
  );
  const [image, setImage] = useState<IS3Image | null>(null);

  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  //All the categories we can select from
  let selectableCategoryList: PProps[] = [];

  props.restaurant.categories.items.map((c) =>
    selectableCategoryList.push({ value: c.id, name: c.name })
  );

  //The categories which are currently selected against a product
  let currentSelectedCategoryList: PProps[] = [];

  props.selectedProduct &&
    props.selectedProduct.categories.items.map((p) =>
      currentSelectedCategoryList.push({
        value: p.category.id,
        name: p.category.name,
      })
    );

  currentSelectedCategoryList.map(
    (selectedCategory) =>
      (selectableCategoryList = selectableCategoryList.filter(
        (category) => category.value != selectedCategory.value
      ))
  );

  let originalSelectedCategories: PProps[] = [...currentSelectedCategoryList];

  const [currentSelectedCategories, setCurrentSelectedCategories] = useState(
    currentSelectedCategoryList
  );
  const [selectableCategories, setSelectableCategories] = useState(
    selectableCategoryList
  );

  const createCategoryProductLink = useMutation(CREATE_CATEGORY_PRODUCT_LINK, {
    update: (proxy, mutationResult) => {},
  });

  const deleteCategoryProductLink = useMutation(DELETE_CATEGORY_PRODUCT_LINK, {
    update: (proxy, mutationResult) => {},
  });

  const deleteProductModifierGroupLink = useMutation(
    DELETE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const createProduct = useMutation(CREATE_PRODUCT, {
    update: (proxy, mutationResult: any) => {
      const newProductID = mutationResult.data.createProduct.id;

      reassignCategoryProductLinks(
        originalSelectedCategories,
        currentSelectedCategories,
        newProductID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateProduct = useMutation(UPDATE_PRODUCT, {
    update: (proxy, mutationResult: any) => {
      const newProductID = mutationResult.data.updateProduct.id;

      reassignCategoryProductLinks(
        originalSelectedCategories,
        currentSelectedCategories,
        newProductID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteProduct = useMutation(DELETE_PRODUCT, {
    update: () => {},
    refetchQueries: props.refetchRestaurant,
  });

  const reassignCategoryProductLinks = (
    originalSelectedCategories: PProps[],
    currentSelectedCategories: PProps[],
    newProductID: string
  ) => {
    let promises: Promise<any>[] = [];

    let categoryLinksToDelete = originalSelectedCategories;
    let categoryLinkToAdd = currentSelectedCategories;

    categoryLinksToDelete.map((originalCategory: PProps) =>
      categoryLinkToAdd.map((newCategory: PProps) => {
        if (originalCategory.value == newCategory.value) {
          categoryLinksToDelete = categoryLinksToDelete.filter(
            (category: PProps) => category.value != originalCategory.value
          );
          categoryLinkToAdd = categoryLinkToAdd.filter(
            (category: PProps) => category.value != originalCategory.value
          );
        }
      })
    );

    categoryLinkToAdd.map((category: PProps) =>
      promises.push(
        createCategoryProductLink({
          variables: {
            categoryProductLinkCategoryId: category.value,
            categoryProductLinkProductId: newProductID,
            displaySequence: 999,
            owner: props.restaurant.restaurantManagerId,
          },
        })
      )
    );

    categoryLinksToDelete.map(
      (categoryDelete) =>
        props.selectedProduct &&
        props.selectedProduct.categories.items.map((c) => {
          if (c.category.id == categoryDelete.value) {
            promises.push(
              deleteCategoryProductLink({
                variables: {
                  id: c.id,
                },
              })
            );
          }
        })
    );

    Promise.all(promises)
      .then((values) => {
        toast.success("New product successfully added");
        props.onProductActionComplete();
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedProduct) {
      props.selectedProduct.categories.items.map((c) => {
        promises.push(
          deleteCategoryProductLink({
            variables: {
              id: c.id,
            },
          })
        );
      });

      props.selectedProduct.modifierGroups.items.map((mg) => {
        promises.push(
          deleteProductModifierGroupLink({
            variables: {
              id: mg.id,
            },
          })
        );
      });

      promises.push(
        deleteProduct({
          variables: {
            id: props.selectedProduct.id,
          },
        })
      );
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("Product successfully deleted");
        props.onProductActionComplete();
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
          name: name,
          description: description || null,
          image: image || null,
          price: convertDollarsToCents(parseFloat(price)),
          productRestaurantId: props.restaurant.id,
          owner: props.restaurant.restaurantManagerId,
        };

        if (props.selectedProduct) {
          variables.id = props.selectedProduct.id;
          delete variables.productRestaurantId;
          delete variables.owner;

          return updateProduct({ variables: variables });
        } else {
          delete variables.id;

          if (!description) {
            delete variables.description;
          }

          if (!image) {
            delete variables.image;
          }

          return createProduct({ variables: variables });
        }
      })
      .catch(() => {
        setShowFullScreenSpinner(false);
      });
  };

  const handleSelectCategory = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let selectedCategory = selectableCategories.filter(
      (category: PProps) => category.value == event.target.value
    );

    setCurrentSelectedCategories([
      ...currentSelectedCategories,
      selectedCategory[0],
    ]);
    setSelectableCategories(
      selectableCategories.filter(
        (category: PProps) => category.value != event.target.value
      )
    );
  };

  const validateAllFields = () => {
    validateName();
    validatePrice();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));
    promises.push(priceSchema.validate(price));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const validatePrice = () => {
    priceSchema
      .validate(price)
      .then(() => setPriceError(""))
      .catch((error) => setPriceError(error.errors));
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const onChangePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const onSetImage = (uploadedImage: IS3Image | null) => {
    setImage(uploadedImage);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onProductActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedProduct ? true : false}
      />
      {/* <form onSubmit={handleSubmit} className={styles.formikForm}> */}
      {/* <DashboardContentWrapper> */}
      <Input
        title="Product"
        name="name"
        autoFocus={true}
        placeholder="Enter product name"
        value={name}
        onChange={onChangeName}
        onBlur={validateName}
        error={nameError}
      />
      <FormFieldSeparator />
      <TextArea
        title="Description"
        // rows={3}
        name="description"
        showOptionalInTitle={true}
        placeholder="Enter product description"
        value={description}
        onChange={onChangeDescription}
      />
      <FormFieldSeparator />
      <Input
        title="Price"
        name="price"
        placeholder="Enter product price in dollars ($)"
        type="number"
        value={price}
        onChange={onChangePrice}
        onBlur={validatePrice}
        error={priceError}
      />
      <FormFieldSeparator />
      <Select
        title="Category"
        // value={productOption}
        name="categoryOption"
        onChange={handleSelectCategory}
      >
        <option value="" label="Select a category to apply product to" />
        {selectableCategories.map((categoryOption: PProps) => (
          <option
            key={categoryOption.value}
            value={categoryOption.value}
            label={categoryOption.name}
          />
        ))}
      </Select>
      <FormFieldSeparator />
      <SelectedProductCategories
        currentSelectedCategories={currentSelectedCategories}
        setCurrentSelectedCategories={setCurrentSelectedCategories}
        selectableCategories={selectableCategories}
        setSelectableCategories={setSelectableCategories}
      />
      <FormFieldSeparator />
      <ImagePicker uploadedImage={image} setUploadedImage={onSetImage} />
      {/* </DashboardContentWrapper> */}
      {/* </form> */}
    </>
  );
};

const SelectedProductCategories = (props: ISelectedProductCategories) => {
  const {
    currentSelectedCategories,
    setCurrentSelectedCategories,
    selectableCategories,
    setSelectableCategories,
  } = props;

  const removeSelectedProduct = (product: PProps) => {
    setSelectableCategories([...selectableCategories, product]);
    setCurrentSelectedCategories(
      currentSelectedCategories.filter(
        (selectedProduct: PProps) => selectedProduct.value != product.value
      )
    );
    logger.debug(product);
  };

  return (
    <div>
      {currentSelectedCategories.map((product: PProps) => (
        <>
          <div className={styles.productCategoryTagWrapper}>
            <span className={styles.productCategoryTag}>{product.name}</span>
            <span
              className={styles.productCategoryTagCross}
              onClick={() => removeSelectedProduct(product)}
            >
              <FontAwesomeIcon icon={faTimes as any} />
            </span>
          </div>
        </>
      ))}
    </div>
  );
};

interface ISelectedProductCategories {
  currentSelectedCategories: PProps[];
  setCurrentSelectedCategories: (currentSelectedCategories: PProps[]) => void;
  selectableCategories: PProps[];
  setSelectableCategories: (selectableCategories: PProps[]) => void;
}

interface PProps {
  value: string;
  name: string;
}

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
  selectedProduct: IGET_DASHBOARD_PRODUCT | null;
  onProductActionComplete: () => void;
}
