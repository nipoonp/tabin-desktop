import React, { useState } from "react";
import { Logger } from "aws-amplify";
import RegisterForm from "./registerForm";
import RegisterTable from "./registerTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_REGISTER,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../graphql/customQueries";
const logger = new Logger("Product register list");

export default (props: IProps) => {
  const [
    selectedRegister,
    setSelectedRegister,
  ] = useState<IGET_DASHBOARD_REGISTER | null>(null);
  const [newRegister, setNewRegister] = useState<boolean>(false);

  const onSelectRegister = (register: IGET_DASHBOARD_REGISTER | null) => {
    setNewRegister(false);
    setSelectedRegister(register);
  };

  const onCreateNew = () => {
    setNewRegister(true);
    setSelectedRegister(null);
  };

  const onBack = () => {
    setNewRegister(false);
    setSelectedRegister(null);
  };

  return (
    <>
      {!selectedRegister && !newRegister ? (
        <RegisterTable
          restaurant={props.restaurant}
          onSelectRegister={onSelectRegister}
          onCreateNew={onCreateNew}
        />
      ) : (
        <RegisterForm
          restaurant={props.restaurant}
          refetchRestaurant={props.refetchRestaurant}
          selectedRegister={selectedRegister}
          onRegisterActionComplete={onBack}
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
