import React from "react";
import Table from "../../../../tabin/components/table";
import { convertCentsToDollars } from "../../../../util/moneyConversion";
import { Logger } from "aws-amplify";
import { Link } from "../../../../tabin/components/link";
import DashboardHeaderNew from "../../dashboardHeaderNew";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import {
  IGET_DASHBOARD_MODIFIER,
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_MODIFIER_GROUP,
} from "../../../../graphql/customQueries";

const logger = new Logger("Modifier list");

export default (props: IProps) => {
  const itemsToRender: IGET_DASHBOARD_MODIFIER[] = [];

  props.restaurant.modifiers.items.map((modifier) =>
    itemsToRender.push(modifier)
  );

  return (
    <>
      <DashboardHeaderNew
        title="Modifiers"
        onCreateNew={props.onCreateNew}
        onDeleteAll={props.onDeleteAll}
      />
      <DashboardContentWrapper>
        {itemsToRender.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Modifiers</th>
                <th>Pricing Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((modifier) => (
                <tr key={modifier.id}>
                  <td>
                    <Link onClick={() => props.onSelectModifier(modifier)}>
                      {modifier.name}
                    </Link>
                  </td>
                  <td>${convertCentsToDollars(modifier.price)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No modifiers added. Create new by clicking "Add New" button</div>
        )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectModifier: (modifier: IGET_DASHBOARD_MODIFIER) => void;
  onCreateNew: () => void;
  onDeleteAll: () => void;
}
