import React, { useState } from "react";
import { useMutation } from "react-apollo-hooks";
import * as yup from "yup";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../tabin/components/toast";
import Input from "../../../tabin/components/input";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";
import { Logger } from "aws-amplify";
import DashboardHeaderEdit from "../dashboardHeaderEdit";
import FormFieldSeparator from "../formFieldSeparator";
import Select from "../../../tabin/components/select";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_REGISTER_PRINTER,
  IGET_DASHBOARD_REGISTER,
} from "../../../graphql/customQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/fontawesome-free-solid";
import { CREATE_REGISTER_PRINTER, CREATE_REGISTER_PRINTER_PRODUCT_LINK, DELETE_REGISTER_PRINTER, DELETE_REGISTER_PRINTER_PRODUCT_LINK, UPDATE_REGISTER_PRINTER } from "../dashboardGraphQL";

const styles = require("./registerPrinterDashboard.module.css");
const logger = new Logger("RegisterPrinterForm");

const nameSchema = yup.string().required("Required");
const addressSchema = yup.string().required("Required");

export default (props: IProps) => {
  const { selectedRegisterPrinter } = props;

  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedRegisterPrinter ? selectedRegisterPrinter.name : ""
  );
  const [address, setAddress] = useState(
    selectedRegisterPrinter ? selectedRegisterPrinter.address : ""
  );

  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");


  //All the products we can select from
  let selectableIgnoreProductsList1: PProps[] = [];

  props.restaurant.products.items.map((p) =>
    selectableIgnoreProductsList1.push({
      value: p.id,
      name: p.name,
    })
  );

  //The products which are currently selected against a modifier group
  let currentSelectedIgnoreProductsList: PProps[] = [];

  props.selectedRegisterPrinter &&
    props.selectedRegisterPrinter.ignoreProducts.items.map((p) =>
      currentSelectedIgnoreProductsList.push({
        value: p.product.id,
        name: p.product.name,
      })
    );

  currentSelectedIgnoreProductsList.map(
    (selectedProduct) =>
      (selectableIgnoreProductsList1 = selectableIgnoreProductsList1.filter(
        (product) => product.value != selectedProduct.value
      ))
  );

  let originalSelectedIgnoreProducts: PProps[] = [...currentSelectedIgnoreProductsList];

  const [currentSelectedIgnoreProducts, setCurrentSelectedIgnoreProducts] = useState(
    currentSelectedIgnoreProductsList
  );
  const [selectableIgnoreProducts, setSelectableIgnoreProducts] = useState(
    selectableIgnoreProductsList1
  );

  const createRegisterPrinter = useMutation(CREATE_REGISTER_PRINTER, {
    update: (proxy, mutationResult: any) => {
      const newRegisterPrinterId = mutationResult.data.createRegisterPrinter.id;

      reassignIgnoreProductLinks(
        originalSelectedIgnoreProducts,
        currentSelectedIgnoreProducts,
        newRegisterPrinterId
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateRegisterPrinter = useMutation(UPDATE_REGISTER_PRINTER, {
    update: (proxy, mutationResult: any) => {
      const newRegisterPrinterId = mutationResult.data.updateRegisterPrinter.id;

      reassignIgnoreProductLinks(
        originalSelectedIgnoreProducts,
        currentSelectedIgnoreProducts,
        newRegisterPrinterId
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteRegisterPrinter = useMutation(DELETE_REGISTER_PRINTER, {
    update: (proxy, mutationResult) => { },
    refetchQueries: props.refetchRestaurant,
  });

  const createRegisterPrinterProductLink = useMutation(CREATE_REGISTER_PRINTER_PRODUCT_LINK, {
    update: (proxy, mutationResult) => { },
  });

  const deleteRegisterPrinterProductLink = useMutation(DELETE_REGISTER_PRINTER_PRODUCT_LINK, {
    update: (proxy, mutationResult) => { },
  });

  const reassignIgnoreProductLinks = (
    originalSelectedProducts: PProps[],
    currentSelectedProducts: PProps[],
    newRegisterPrinterId: String
  ) => {
    let promises: Promise<any>[] = [];

    let productLinksToDelete = originalSelectedProducts;
    let productLinkToAdd = currentSelectedProducts;

    productLinksToDelete.map((originalProduct: PProps) =>
      productLinkToAdd.map((newProduct: PProps) => {
        if (originalProduct.value == newProduct.value) {
          productLinksToDelete = productLinksToDelete.filter(
            (product: PProps) => product.value != originalProduct.value
          );

          productLinkToAdd = productLinkToAdd.filter(
            (product: PProps) => product.value != originalProduct.value
          );
        }
      })
    );

    productLinkToAdd.map((product: PProps) =>
      promises.push(
        createRegisterPrinterProductLink({
          variables: {
            registerPrinterProductLinkProductId: product.value,
            registerPrinterProductLinkRegisterPrinterId: newRegisterPrinterId,
            owner: props.restaurant.restaurantManagerId,
          },
        })
      )
    );

    productLinksToDelete.map(
      (productDelete) =>
        props.selectedRegisterPrinter &&
        props.selectedRegisterPrinter.ignoreProducts.items.map((p) => {
          if (p.product.id == productDelete.value) {
            promises.push(
              deleteRegisterPrinterProductLink({
                variables: {
                  id: p.id,
                },
              })
            );
          }
        })
    );

    Promise.all(promises)
      .then((values) => {
        toast.success("New registerPrinter ignore products successfully added");
        props.onRegisterPrinterActionComplete();
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedRegisterPrinter) {
      props.selectedRegisterPrinter.ignoreProducts.items.map((p) => {
        promises.push(
          deleteRegisterPrinterProductLink({
            variables: {
              id: p.id,
            },
          })
        );
      });

      promises.push(
        deleteRegisterPrinter({
          variables: {
            id: props.selectedRegisterPrinter.id,
          },
        })
      );

      Promise.all(promises)
        .then((values) => {
          toast.success("Modifier Group successfully deleted");
          props.onRegisterPrinterActionComplete();
        })
        .catch((error) =>
          toast.error("There was an error processing you request")
        )
        .finally(() => setShowFullScreenSpinner(false));
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("RegisterPrinter printer successfully deleted");
        props.onRegisterPrinterActionComplete();
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
        if (props.selectedRegisterPrinter) {
          return updateRegisterPrinter({
            variables: {
              id: props.selectedRegisterPrinter.id,
              name: name,
              address: address,
            },
          });
        } else {
          return createRegisterPrinter({
            variables: {
              registerPrinterRegisterId: props.currentRegister.id,
              name: name,
              address: address,
              owner: props.restaurant.restaurantManagerId,
            },
          });
        }
      })
      .catch(() => {
        setShowFullScreenSpinner(false);
      });
  };

  const validateAllFields = () => {
    validateName();
    validateAddress();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));
    promises.push(addressSchema.validate(address));

    return Promise.all(promises);
  };

  const handleSelectIgnoreProduct1 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedProduct = selectableIgnoreProducts.filter(
      (product: PProps) => product.value == event.target.value
    );

    setCurrentSelectedIgnoreProducts([
      ...currentSelectedIgnoreProducts,
      selectedProduct[0],
    ]);
    setSelectableIgnoreProducts(
      selectableIgnoreProducts.filter(
        (product: PProps) => product.value != event.target.value
      )
    );
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const validateAddress = () => {
    addressSchema
      .validate(address)
      .then(() => setAddressError(""))
      .catch((error) => setAddressError(error.errors));
  };

  const onChangeName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setName(event.target.value);
    setNameError("");
  };

  const onChangeAddress = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(event.target.value);
    setAddressError("");
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onRegisterPrinterActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedRegisterPrinter ? true : false}
      />
      {/* <form onSubmit={onSubmit}*/}
      <Input
        title="Name"
        name="name"
        value={name}
        onChange={onChangeName}
        error={nameError}
      />
      <FormFieldSeparator />
      <Input
        title="Printer Address"
        name="address"
        value={address}
        error={addressError}
        onChange={onChangeAddress}
      />
      <FormFieldSeparator />
      <Select
        title="Receipt Printer 1 Product Ignore List"
        // value={productOption}
        name="productIgnoreList1"
        onChange={handleSelectIgnoreProduct1}
      >
        <option value="" label="" />
        {selectableIgnoreProducts.map((productOption: PProps) => (
          <option
            key={productOption.value}
            value={productOption.value}
            label={productOption.name}
          />
        ))}
      </Select>
      <FormFieldSeparator />
      <SelectedIgnoreProducts
        currentSelectedProducts={currentSelectedIgnoreProducts}
        setCurrentSelectedProducts={setCurrentSelectedIgnoreProducts}
        selectableProducts={selectableIgnoreProducts}
        setSelectableProducts={setSelectableIgnoreProducts}
      />
      {/* </form> */}
    </>
  );
};


const SelectedIgnoreProducts = (
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

  return (
    <div>
      {currentSelectedProducts.map((product: PProps) => (
        <>
          <div className={styles.registerPrinterProductTagWrapper}>
            <span className={styles.registerPrinterProductTag}>
              {product.name}
            </span>
            <span
              className={styles.registerPrinterProductTagCross}
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

interface ISelectedModifierGroupProducts {
  currentSelectedProducts: PProps[];
  setCurrentSelectedProducts: (currentSelectedProducts: PProps[]) => void;
  selectableProducts: PProps[];
  setSelectableProducts: (selectableProducts: PProps[]) => void;
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
  currentRegister: IGET_DASHBOARD_REGISTER;
  selectedRegisterPrinter: IGET_DASHBOARD_REGISTER_PRINTER | null;
  onRegisterPrinterActionComplete: () => void;
}
