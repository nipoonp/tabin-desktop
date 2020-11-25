import React, { useState } from "react";
import Table from "../../../../tabin/components/table";
import { Link } from "../../../../tabin/components/link";
import DashboardHeaderNew from "../../dashboardHeaderNew";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import {
  IGET_DASHBOARD_CATEGORY,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../../graphql/customQueries";

export default (props: IProps) => {
  const itemsToRender: IGET_DASHBOARD_CATEGORY[] = [];

  props.restaurant.categories.items.map((c) => itemsToRender.push(c));

  return (
    <>
      <DashboardHeaderNew
        title="Categories"
        onCreateNew={props.onCreateNew}
        onDeleteAll={props.onDeleteAll}
      />
      <DashboardContentWrapper>
        {itemsToRender.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((category: any) => (
                <tr key={category.id}>
                  <td>
                    <Link onClick={() => props.onSelectCategory(category)}>
                      {category.name}
                    </Link>
                  </td>
                  <td>{category.products.items.length}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>
            No product categories added. Create new by clicking "Add New" button
          </div>
        )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectCategory: (category: IGET_DASHBOARD_CATEGORY) => void;
  onCreateNew: () => void;
  onDeleteAll: () => void;
}
