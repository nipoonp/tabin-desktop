import React, { useState } from "react";
import Table from "../../../../tabin/components/table";
import { convertCentsToDollars } from "../../../../util/moneyConversion";
import { Link } from "../../../../tabin/components/link";
import DashboardHeaderNew from "../../dashboardHeaderNew";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_PRODUCT,
} from "../../../../graphql/customQueries";

export default (props: IProps) => {
  return (
    <>
      <DashboardHeaderNew
        title="Products"
        onCreateNew={props.onCreateNew}
        onDeleteAll={props.onDeleteAll}
      />
      <DashboardContentWrapper>
        {props.restaurant.products.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Description</th>
                {/* <th>Category</th> */}
                <th>Modifier Groups</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {props.restaurant.products.items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link onClick={() => props.onSelectProduct(p)}>
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.description}</td>
                  {/* <td>{p.category.name}</td> */}
                  <td>{p.modifierGroups.items.length}</td>
                  <td>${convertCentsToDollars(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No products added. Create new by clicking "Add New" button</div>
        )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectProduct: (product: IGET_DASHBOARD_PRODUCT) => void;
  onCreateNew: () => void;
  onDeleteAll: () => void;
}
