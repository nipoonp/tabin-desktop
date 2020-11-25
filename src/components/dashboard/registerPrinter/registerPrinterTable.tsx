import React, { useState } from "react";
import Table from "../../../tabin/components/table";
import { Link } from "../../../tabin/components/link";
import DashboardHeaderNew from "../dashboardHeaderNew";
import DashboardContentWrapper from "../dashboardContentWrapper";
import {
  IGET_DASHBOARD_REGISTER,
  IGET_DASHBOARD_REGISTER_PRINTER,
} from "../../../graphql/customQueries";

export default (props: IProps) => {
  const itemsToRender: IGET_DASHBOARD_REGISTER_PRINTER[] = [];

  props.currentRegister.printers.items.map((c) => itemsToRender.push(c));

  return (
    <>
      <DashboardHeaderNew title="Register Printers" onCreateNew={props.onCreateNew} />
      <DashboardContentWrapper>
        {itemsToRender.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((registerPrinter) => (
                <tr key={registerPrinter.id}>
                  <td>
                    <Link onClick={() => props.onSelectRegisterPrinter(registerPrinter)}>
                      {registerPrinter.name}
                    </Link>
                  </td>
                  <td>{registerPrinter.address}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
            <div>
              No register printers added. Create new by clicking "Add New" button
            </div>
          )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  currentRegister: IGET_DASHBOARD_REGISTER;
  onSelectRegisterPrinter: (register: IGET_DASHBOARD_REGISTER_PRINTER) => void;
  onCreateNew: () => void;
}
