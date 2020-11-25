import React, { useState } from "react";
import {
  CREATE_MODIFIER_GROUP,
  UPDATE_MODIFIER_GROUP,
  DELETE_MODIFIER_GROUP,
  DELETE_PRODUCT_MODIFIER_GROUP_LINK,
  CREATE_PRODUCT_MODIFIER_GROUP_LINK,
  DELETE_MODIFIER_GROUP_MODIFIER_LINK,
  UPDATE_PRODUCT_MODIFIER_GROUP_LINK,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import Input from "../../../../tabin/components/input";
import Select from "../../../../tabin/components/select";
import * as yup from "yup";
import { Logger } from "aws-amplify";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../../tabin/components/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/fontawesome-free-solid";
// import ModifierDashboard from "../modifier/modifierDashboard";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import DashboardHeaderEdit from "../../dashboardHeaderEdit";
import FormFieldSeparator from "../../formFieldSeparator";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_MODIFIER_GROUP,
  IGET_DASHBOARD_MODIFIERS,
  IGET_DASHBOARD_PRODUCTS,
} from "../../../../graphql/customQueries";
import { Space2 } from "../../../../tabin/components/spaces";
import { Checkbox } from "../../../../tabin/components/checkbox";

const logger = new Logger("ModifierGroupForm");
const styles = require("./modifierGroupDashboard.module.css");

const nameSchema = yup.string().required("Required");
const choiceMinSchema = yup.string().required("Required");
const choiceMaxSchema = yup.string().required("Required");
const choiceDuplicateSchema = yup.string().required("Required");

export default (props: IProps) => {
  const { selectedModifierGroup } = props;
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedModifierGroup ? selectedModifierGroup.name : ""
  );
  const [choiceMin, setChoiceMin] = useState(
    selectedModifierGroup ? selectedModifierGroup.choiceMin : ""
  );
  const [choiceMax, setChoiceMax] = useState(
    selectedModifierGroup ? selectedModifierGroup.choiceMax : ""
  );
  const [choiceDuplicate, setChoiceDuplicate] = useState(
    selectedModifierGroup ? selectedModifierGroup.choiceDuplicate : ""
  );

  const [nameError, setNameError] = useState<string>();
  const [choiceMinError, setChoiceMinError] = useState<string>();
  const [choiceMaxError, setChoiceMaxError] = useState<string>();
  const [choiceDuplicateError, setChoiceDuplicateError] = useState<string>();

  //All the products we can select from
  let selectableProductList: PProps[] = [];

  props.restaurant.products.items.map((p) =>
    selectableProductList.push({
      value: p.id,
      name: p.name,
      hideForCustomer: false,
    })
  );

  //The products which are currently selected against a modifier group
  let currentSelectedProductList: PProps[] = [];

  props.selectedModifierGroup &&
    props.selectedModifierGroup.products.items.map((p) =>
      currentSelectedProductList.push({
        value: p.product.id,
        name: p.product.name,
        hideForCustomer: p.hideForCustomer || false,
      })
    );

  currentSelectedProductList.map(
    (selectedProduct) =>
      (selectableProductList = selectableProductList.filter(
        (product) => product.value != selectedProduct.value
      ))
  );

  let originalSelectedProducts: PProps[] = [...currentSelectedProductList];

  const [currentSelectedProducts, setCurrentSelectedProducts] = useState(
    currentSelectedProductList
  );
  const [selectableProducts, setSelectableProducts] = useState(
    selectableProductList
  );

  const createProductModifierGroupLink = useMutation(
    CREATE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => { },
    }
  );

  const updateProductModifierGroupLink = useMutation(
    UPDATE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => { },
    }
  );

  const deleteProductModifierGroupLink = useMutation(
    DELETE_PRODUCT_MODIFIER_GROUP_LINK,
    {
      update: (proxy, mutationResult) => { },
    }
  );

  const createModifierGroup = useMutation(CREATE_MODIFIER_GROUP, {
    update: (proxy, mutationResult: any) => {
      const newModifierGroupID = mutationResult.data.createModifierGroup.id;

      reassignProductModifierGroupLinks(
        originalSelectedProducts,
        currentSelectedProducts,
        newModifierGroupID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateModifierGroup = useMutation(UPDATE_MODIFIER_GROUP, {
    update: (proxy, mutationResult: any) => {
      const newModifierGroupID = mutationResult.data.updateModifierGroup.id;

      reassignProductModifierGroupLinks(
        originalSelectedProducts,
        currentSelectedProducts,
        newModifierGroupID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteModifierGroup = useMutation(DELETE_MODIFIER_GROUP, {
    update: (proxy, mutationResult) => { },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteModifierGroupModifierLink = useMutation(
    DELETE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => { },
    }
  );

  const reassignProductModifierGroupLinks = (
    originalSelectedProducts: PProps[],
    currentSelectedProducts: PProps[],
    newModifierGroupID: string
  ) => {
    let promises: Promise<any>[] = [];

    let productLinksToDelete = originalSelectedProducts;
    let productLinkToAdd = currentSelectedProducts;
    let productLinksToUpdate: PProps[] = [];

    productLinksToDelete.map((originalProduct: PProps) =>
      productLinkToAdd.map((newProduct: PProps) => {
        if (originalProduct.value == newProduct.value) {
          productLinksToDelete = productLinksToDelete.filter(
            (product: PProps) => product.value != originalProduct.value
          );

          productLinkToAdd = productLinkToAdd.filter(
            (product: PProps) => product.value != originalProduct.value
          );

          productLinksToUpdate.push(newProduct);
        }
      })
    );

    productLinkToAdd.map((product: PProps) =>
      promises.push(
        createProductModifierGroupLink({
          variables: {
            productModifierGroupProductId: product.value,
            productModifierGroupModifierGroupId: newModifierGroupID,
            displaySequence: 999,
            hideForCustomer: product.hideForCustomer,
            owner: props.restaurant.restaurantManagerId,
          },
        })
      )
    );

    productLinksToDelete.map(
      (productDelete) =>
        props.selectedModifierGroup &&
        props.selectedModifierGroup.products.items.map((p) => {
          if (p.product.id == productDelete.value) {
            promises.push(
              deleteProductModifierGroupLink({
                variables: {
                  id: p.id,
                },
              })
            );
          }
        })
    );

    productLinksToUpdate.map(
      (productUpdate) =>
        props.selectedModifierGroup &&
        props.selectedModifierGroup.products.items.map((p) => {
          if (
            p.product.id == productUpdate.value &&
            p.hideForCustomer != productUpdate.hideForCustomer
          ) {
            promises.push(
              updateProductModifierGroupLink({
                variables: {
                  id: p.id,
                  hideForCustomer: productUpdate.hideForCustomer,
                },
              })
            );
          }
        })
    );

    Promise.all(promises)
      .then((values) => {
        toast.success("New modifier group successfully added");
        props.onModifierGroupActionComplete();
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
        if (props.selectedModifierGroup) {
          return updateModifierGroup({
            variables: {
              id: props.selectedModifierGroup.id,
              name: name,
              choiceMin: choiceMin,
              choiceMax: choiceMax,
              choiceDuplicate: choiceDuplicate,
            },
          });
        } else {
          return createModifierGroup({
            variables: {
              modifierGroupRestaurantId: props.restaurant.id,
              name: name,
              choiceMin: choiceMin,
              choiceMax: choiceMax,
              choiceDuplicate: choiceDuplicate,
              owner: props.restaurant.restaurantManagerId,
            },
          });
        }
      })
      .catch(() => {
        setShowFullScreenSpinner(false);
      });
  };

  const handleSelectProduct = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedProduct = selectableProducts.filter(
      (product: PProps) => product.value == event.target.value
    );

    setCurrentSelectedProducts([
      ...currentSelectedProducts,
      selectedProduct[0],
    ]);
    setSelectableProducts(
      selectableProducts.filter(
        (product: PProps) => product.value != event.target.value
      )
    );
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedModifierGroup) {
      props.selectedModifierGroup.products.items.map((p) => {
        promises.push(
          deleteProductModifierGroupLink({
            variables: {
              id: p.id,
            },
          })
        );
      });

      props.selectedModifierGroup.modifiers.items.map(
        (m: IGET_DASHBOARD_MODIFIERS) => {
          promises.push(
            deleteModifierGroupModifierLink({
              variables: {
                id: m.id,
              },
            })
          );
        }
      );

      promises.push(
        deleteModifierGroup({
          variables: {
            id: props.selectedModifierGroup.id,
          },
        })
      );

      Promise.all(promises)
        .then((values) => {
          toast.success("Modifier Group successfully deleted");
          props.onModifierGroupActionComplete();
        })
        .catch((error) =>
          toast.error("There was an error processing you request")
        )
        .finally(() => setShowFullScreenSpinner(false));
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangeChoiceMin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChoiceMin(parseInt(event.target.value));
  };

  const onChangeChoiceMax = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChoiceMax(parseInt(event.target.value));
  };

  const onChangeChoiceDuplicate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setChoiceDuplicate(parseInt(event.target.value));
  };

  const validateAllFields = () => {
    validateName();
    validateChoiceMin();
    validateChoiceMax();
    validateChoiceDuplicate();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));
    promises.push(choiceMinSchema.validate(choiceMin));
    promises.push(choiceMaxSchema.validate(choiceMax));
    promises.push(choiceDuplicateSchema.validate(choiceDuplicate));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const validateChoiceMin = () => {
    choiceMinSchema
      .validate(choiceMin)
      .then(() => setChoiceMinError(""))
      .catch((error) => setChoiceMinError(error.errors));
  };

  const validateChoiceMax = () => {
    choiceMaxSchema
      .validate(choiceMax)
      .then(() => setChoiceMaxError(""))
      .catch((error) => setChoiceMaxError(error.errors));
  };

  const validateChoiceDuplicate = () => {
    choiceDuplicateSchema
      .validate(choiceDuplicate)
      .then(() => setChoiceDuplicateError(""))
      .catch((error) => setChoiceDuplicateError(error.errors));
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onModifierGroupActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedModifierGroup ? true : false}
      />
      {/* <form onSubmit={handleSubmit} className={styles.formikForm}> */}
      {/* <DashboardContentWrapper> */}
      <Input
        title="Modifier Group"
        name="name"
        placeholder="Enter modifier group name"
        autoFocus={true}
        value={name}
        onChange={onChangeName}
        onBlur={validateName}
        error={nameError}
      />
      <FormFieldSeparator />
      <Input
        title="Choice Min"
        name="choiceMin"
        placeholder="Enter the minimum number of selections to make"
        type="number"
        value={choiceMin}
        onChange={onChangeChoiceMin}
        onBlur={validateChoiceMin}
        error={choiceMinError}
      />
      <FormFieldSeparator />
      <Input
        title="Choice Max"
        name="choiceMax"
        placeholder="Enter the maximum number of selections to make"
        type="number"
        value={choiceMax}
        onChange={onChangeChoiceMax}
        onBlur={validateChoiceMax}
        error={choiceMaxError}
      />
      <FormFieldSeparator />
      <Input
        title="Number Of Any Single Item"
        name="choiceDuplicate"
        placeholder="How many times can customers select any single item?"
        type="number"
        value={choiceDuplicate}
        onChange={onChangeChoiceDuplicate}
        onBlur={validateChoiceDuplicate}
        error={choiceDuplicateError}
      />
      <FormFieldSeparator />
      <Select
        title="Product"
        // value={productOption}
        name="productOption"
        onChange={handleSelectProduct}
      >
        <option value="" label="Select a product to apply modifier group to" />
        {selectableProducts.map((productOption: PProps) => (
          <option
            key={productOption.value}
            value={productOption.value}
            label={productOption.name}
          />
        ))}
      </Select>
      <FormFieldSeparator />
      <SelectedModifierGroupProducts
        currentSelectedProducts={currentSelectedProducts}
        setCurrentSelectedProducts={setCurrentSelectedProducts}
        selectableProducts={selectableProducts}
        setSelectableProducts={setSelectableProducts}
      />
      {/* </DashboardContentWrapper> */}
      {/* </form> */}
      {props.selectedModifierGroup && (
        <>
          <FormFieldSeparator />
          {/* <ModifierDashboard
            restaurant={props.restaurant}
            refetchRestaurant={props.refetchRestaurant}
            selectedModifierGroup={props.selectedModifierGroup}
          /> */}
        </>
      )}
    </>
  );
};

const SelectedModifierGroupProducts = (
  props: ISelectedModifierGroupProducts
) => {
  const {
    currentSelectedProducts,
    setCurrentSelectedProducts,
    selectableProducts,
    setSelectableProducts,
  } = props;

  const removeSelectedProduct = (product: PProps) => {
    setSelectableProducts([...selectableProducts, product]);
    setCurrentSelectedProducts(
      currentSelectedProducts.filter(
        (selectedProduct: PProps) => selectedProduct.value != product.value
      )
    );
    logger.debug(product);
  };

  const onClickHideForCustomer = (
    product: PProps,
    hideForCustomer: boolean
  ) => {
    let newList = currentSelectedProducts.filter(
      (selectedProduct: PProps) => selectedProduct.value != product.value
    );

    newList = [
      ...newList,
      {
        name: product.name,
        value: product.value,
        hideForCustomer: hideForCustomer,
      },
    ];

    setCurrentSelectedProducts(newList);
    console.log(product);
  };

  return (
    <div>
      {currentSelectedProducts.map((product: PProps) => (
        <>
          <div className={styles.modifierGroupProductTagWrapper}>
            <span className={styles.modifierGroupProductTag}>
              {product.name}
            </span>
            <span
              className={styles.modifierGroupProductTagCross}
              onClick={() => removeSelectedProduct(product)}
            >
              <FontAwesomeIcon icon={faTimes as any} />
            </span>
            <Space2 />
            <div
              style={{
                backgroundColor: "white",
                padding: "8px",
                borderRadius: "6px",
                color: "black",
              }}
            >
              <Checkbox
                checked={product.hideForCustomer}
                onCheck={() => onClickHideForCustomer(product, true)}
                onUnCheck={() => onClickHideForCustomer(product, false)}
              >
                Hide for Customer
              </Checkbox>
            </div>
          </div>
          <Space2 />
        </>
      ))}
    </div>
  );
};

interface ISelectedModifierGroupProducts {
  currentSelectedProducts: PProps[];
  setCurrentSelectedProducts: (currentSelectedProducts: PProps[]) => void;
  selectableProducts: PProps[];
  setSelectableProducts: (selectableProducts: PProps[]) => void;
}

interface PProps {
  value: string;
  name: string;
  hideForCustomer: boolean;
}

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
  | ((result: any) => (string | PureQueryOptions)[])
  | (string | PureQueryOptions)[]
  | undefined;
  selectedModifierGroup: IGET_DASHBOARD_MODIFIER_GROUP | null;
  onModifierGroupActionComplete: () => void;
}
