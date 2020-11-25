import React, { useState, useEffect } from "react";
import {
  CREATE_REGISTER,
  UPDATE_REGISTER,
  DELETE_REGISTER,
} from "../dashboardGraphQL";
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
  IGET_DASHBOARD_REGISTER,
} from "../../../graphql/customQueries";
import { Checkbox } from "../../../tabin/components/checkbox";
import RegisterPrinterDashboard from "../registerPrinter/registerPrinterDashboard"

const logger = new Logger("RegisterForm");

const nameSchema = yup.string().required("Required");
const typeSchema = yup.string().required("Required");
const eftposProviderSchema = yup.string().required("Required");

export default (props: IProps) => {
  let isMounted = false;

  useEffect(() => {
    isMounted = true;

    // returned function will be called on component unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const { selectedRegister } = props;

  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedRegister ? selectedRegister.name : ""
  );
  const [enableTableFlags, setEnableTableFlags] = useState(
    selectedRegister ? selectedRegister.enableTableFlags : false
  );
  const [enablePayLater, setEnablePayLater] = useState(
    selectedRegister ? selectedRegister.enablePayLater : false
  );
  const [type, setType] = useState(
    selectedRegister ? selectedRegister.type : ""
  );
  const [eftposProvider, setEftposProvider] = useState(
    selectedRegister ? selectedRegister.eftposProvider : ""
  );
  const [eftposIpAddress, setEftposIpAddress] = useState(
    selectedRegister ? selectedRegister.eftposIpAddress : ""
  );
  const [eftposPortNumber, setEftposPortNumber] = useState(
    selectedRegister ? selectedRegister.eftposPortNumber : ""
  );
  const [orderNumberSuffix, setOrderNumberSuffix] = useState(
    selectedRegister ? selectedRegister.orderNumberSuffix : ""
  );

  const [nameError, setNameError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [eftposProviderError, setEftposProviderError] = useState("");

  const createRegister = useMutation(CREATE_REGISTER, {
    update: (proxy, mutationResult: any) => {
      toast.success("New register successfully added");
      props.onRegisterActionComplete();

      if (isMounted) {
        setShowFullScreenSpinner(false);
      }
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateRegister = useMutation(UPDATE_REGISTER, {
    update: (proxy, mutationResult: any) => {

      toast.success("Register successfully updated");
      props.onRegisterActionComplete();

      if (isMounted) {
        setShowFullScreenSpinner(false);
      }
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteRegister = useMutation(DELETE_REGISTER, {
    update: (proxy, mutationResult) => { },
    refetchQueries: props.refetchRestaurant,
  });

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedRegister) {
      promises.push(
        deleteRegister({
          variables: {
            id: props.selectedRegister.id,
          },
        })
      );
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("Register successfully deleted");
        props.onRegisterActionComplete();
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
          active: false,
          name: name,
          enableTableFlags: enableTableFlags,
          enablePayLater: enablePayLater,
          type: type,
          eftposProvider: eftposProvider,
          eftposIpAddress: eftposIpAddress || null,
          eftposPortNumber: eftposPortNumber || null,
          orderNumberSuffix: orderNumberSuffix || null,
          registerRestaurantId: props.restaurant.id,
          owner: props.restaurant.restaurantManagerId,
        };

        if (props.selectedRegister) {
          variables.id = props.selectedRegister.id;
          delete variables.active;
          delete variables.registerRestaurantId;
          delete variables.owner;

          updateRegister({ variables: variables });
        } else {
          delete variables.id;

          if (!eftposIpAddress) {
            delete variables.eftposIpAddress;
          }

          if (!eftposPortNumber) {
            delete variables.eftposPortNumber;
          }

          if (!orderNumberSuffix) {
            delete variables.orderNumberSuffix;
          }

          createRegister({ variables: variables });
        }
      })
      .catch(() => setShowFullScreenSpinner(false));
  };

  const validateAllFields = () => {
    validateName();
    validateType();
    validateEftposProvider();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));
    promises.push(typeSchema.validate(type));
    promises.push(eftposProviderSchema.validate(eftposProvider));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const validateType = () => {
    typeSchema
      .validate(type)
      .then(() => setTypeError(""))
      .catch((error) => setTypeError(error.errors));
  };

  const validateEftposProvider = () => {
    typeSchema
      .validate(eftposProvider)
      .then(() => setEftposProviderError(""))
      .catch((error) => setEftposProviderError(error.errors));
  };

  const onChangeName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setName(event.target.value);
    setNameError("");
  };

  const handleSelectRegisterType = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setType(event.target.value);
    setTypeError("");
  };

  const handleSelectEftposProvider = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setEftposProvider(event.target.value);
    setEftposProviderError("");
  };

  const onChangeEftposIpAddress = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEftposIpAddress(event.target.value);
  };

  const onChangeEftposPortNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEftposPortNumber(event.target.value);
  };

  const onChangeOrderNumberSuffix = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOrderNumberSuffix(event.target.value);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onRegisterActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedRegister ? true : false}
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
      <Select
        title="Register Type"
        name="registerTypeOption"
        value={type}
        onChange={handleSelectRegisterType}
        error={typeError}
      >
        <option value="" label="Select the type of register" />
        <option key="KIOSK" value="KIOSK" label="Kiosk" />
        <option key="POS" value="POS" label="PoS" />
      </Select>
      <FormFieldSeparator />
      <Select
        title="Eftpos Provider"
        // value={productOption}
        name="eftposProviderOption"
        value={eftposProvider}
        onChange={handleSelectEftposProvider}
        error={eftposProviderError}
      >
        <option value="" label="Select the Eftpos provider for this register" />
        <option key="VERIFONE" value="VERIFONE" label="Verifone" />
        <option key="SMARTPAY" value="SMARTPAY" label="Smartpay" />
      </Select>
      <FormFieldSeparator />
      <Input
        title="Eftpos IP Address (Only valid for Verifone)"
        name="eftposIpAddress"
        value={eftposIpAddress}
        onChange={onChangeEftposIpAddress}
      />
      <FormFieldSeparator />
      <Input
        title="Eftpos Port Number (Only valid for Verifone)"
        name="eftposPortNumber"
        value={eftposPortNumber}
        onChange={onChangeEftposPortNumber}
      />
      <FormFieldSeparator />
      <Input
        title="Order Number Suffix"
        name="orderNumberSuffix"
        value={orderNumberSuffix}
        onChange={onChangeOrderNumberSuffix}
      />
      <FormFieldSeparator />
      <Checkbox
        checked={enableTableFlags}
        onCheck={() => setEnableTableFlags(true)}
        onUnCheck={() => setEnableTableFlags(false)}
      >
        Enable Table Flags
        </Checkbox>
      <FormFieldSeparator />
      <Checkbox
        checked={enablePayLater}
        onCheck={() => setEnablePayLater(true)}
        onUnCheck={() => setEnablePayLater(false)}
      >
        Enable Pay Later
        </Checkbox>
      <FormFieldSeparator />
      {selectedRegister &&
        <RegisterPrinterDashboard
          restaurant={props.restaurant}
          currentRegister={selectedRegister}
          refetchRestaurant={props.refetchRestaurant}
        />
      }
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
  selectedRegister: IGET_DASHBOARD_REGISTER | null;
  onRegisterActionComplete: () => void;
}
