import React, { useState } from "react";
import Table from "../../../../tabin/components/table";
// import { IRestaurant, IModifierGroup } from "../../../../model/model";
import { Link } from "../../../../tabin/components/link";
import DashboardHeaderNew from "../../dashboardHeaderNew";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import {
  IGET_DASHBOARD_MODIFIER_GROUP,
  IGET_DASHBOARD_RESTAURANT,
} from "../../../../graphql/customQueries";

export default (props: IProps) => {
  const itemsToRender: IGET_DASHBOARD_MODIFIER_GROUP[] = [];

  props.restaurant.modifierGroups.items.map((modifierGroup) => {
    itemsToRender.push(modifierGroup);
  });

  return (
    <>
      <DashboardHeaderNew
        title="Modifier Groups"
        onCreateNew={props.onCreateNew}
        onDeleteAll={props.onDeleteAll}
      />
      <DashboardContentWrapper>
        {itemsToRender.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Modifier Groups</th>
                <th>Choice Min</th>
                <th>Choice Max</th>
                <th>Any Single Item</th>
                <th>Modifiers</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((mg: IGET_DASHBOARD_MODIFIER_GROUP) => (
                <tr key={mg.id}>
                  <td>
                    <Link onClick={() => props.onSelectModifierGroup(mg)}>
                      {mg.name}
                    </Link>
                  </td>
                  <td>{mg.choiceMin}</td>
                  <td>{mg.choiceMax}</td>
                  <td>{mg.choiceDuplicate}</td>
                  <td>{mg.modifiers.items.length}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>
            No modifier groups added. Create new by clicking "Add New" button
          </div>
        )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectModifierGroup: (modifierGroup: IGET_DASHBOARD_MODIFIER_GROUP) => void;
  onCreateNew: () => void;
  onDeleteAll: () => void;
}
