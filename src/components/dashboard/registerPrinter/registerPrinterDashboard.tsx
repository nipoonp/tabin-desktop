import React, { useState } from "react";
import { Logger } from "aws-amplify";
import RegisterPrinterForm from "./registerPrinterForm";
import RegisterPrinterTable from "./registerPrinterTable";
import { PureQueryOptions } from "apollo-client/core/types";
import {
  IGET_DASHBOARD_REGISTER,
  IGET_DASHBOARD_REGISTER_PRINTER,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../graphql/customQueries";
const logger = new Logger("Product registerPrinter list");

export default (props: IProps) => {
  const [
    selectedRegisterPrinter,
    setSelectedRegisterPrinter,
  ] = useState<IGET_DASHBOARD_REGISTER_PRINTER | null>(null);
  const [newRegisterPrinter, setNewRegisterPrinter] = useState<boolean>(false);

  const onSelectRegisterPrinter = (registerPrinter: IGET_DASHBOARD_REGISTER_PRINTER | null) => {
    setNewRegisterPrinter(false);
    setSelectedRegisterPrinter(registerPrinter);
  };

  const onCreateNew = () => {
    setNewRegisterPrinter(true);
    setSelectedRegisterPrinter(null);
  };

  const onBack = () => {
    setNewRegisterPrinter(false);
    setSelectedRegisterPrinter(null);
  };

  return (
    <>
      {!selectedRegisterPrinter && !newRegisterPrinter ? (
        <RegisterPrinterTable
          currentRegister={props.currentRegister}
          onSelectRegisterPrinter={onSelectRegisterPrinter}
          onCreateNew={onCreateNew}
        />
      ) : (
          <RegisterPrinterForm
            restaurant={props.restaurant}
            refetchRestaurant={props.refetchRestaurant}
            currentRegister={props.currentRegister}
            selectedRegisterPrinter={selectedRegisterPrinter}
            onRegisterPrinterActionComplete={onBack}
          />
        )}
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  currentRegister: IGET_DASHBOARD_REGISTER;
  refetchRestaurant:
  | ((result: any) => (string | PureQueryOptions)[])
  | (string | PureQueryOptions)[]
  | undefined;
}
