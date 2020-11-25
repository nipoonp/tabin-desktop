import React, { useState } from "react";
import Table from "../../../tabin/components/table";
import { Link } from "../../../tabin/components/link";
import DashboardHeaderNew from "../dashboardHeaderNew";
import DashboardContentWrapper from "../dashboardContentWrapper";
import {
  IGET_DASHBOARD_REGISTER,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../graphql/customQueries";

export default (props: IProps) => {
  const itemsToRender: IGET_DASHBOARD_REGISTER[] = [];

  props.restaurant.registers.items.map((c) => itemsToRender.push(c));

  return (
    <>
      <DashboardHeaderNew title="Registers" onCreateNew={props.onCreateNew} />
      <DashboardContentWrapper>
        {itemsToRender.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Eftpos Provider</th>
                <th>Enable Table Flags</th>
                <th>Enable Pay Later</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((register) => (
                <tr key={register.id}>
                  <td>
                    <Link onClick={() => props.onSelectRegister(register)}>
                      {register.name}
                    </Link>
                  </td>
                  <td>{register.type}</td>
                  <td>{register.eftposProvider}</td>
                  <td>{register.enableTableFlags == true ? "Enabled" : "Disabled"}</td>
                  <td>{register.enablePayLater == true ? "Enabled" : "Disabled"}</td>
                  <td>{register.active == true ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
            <div>
              No product registers added. Create new by clicking "Add New" button
            </div>
          )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectRegister: (register: IGET_DASHBOARD_REGISTER) => void;
  onCreateNew: () => void;
}
