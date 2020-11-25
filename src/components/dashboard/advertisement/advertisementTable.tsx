import React, { useState } from "react";
import Table from "../../../tabin/components/table";
import { Link } from "../../../tabin/components/link";
import DashboardHeaderNew from "../dashboardHeaderNew";
import DashboardContentWrapper from "../dashboardContentWrapper";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_ADVERTISEMENT,
} from "../../../graphql/customQueries";

export default (props: IProps) => {
  return (
    <>
      <DashboardHeaderNew
        title="Advertisements"
        onCreateNew={props.onCreateNew}
        onDeleteAll={props.onDeleteAll}
      />
      <DashboardContentWrapper>
        {props.restaurant.advertisements.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {props.restaurant.advertisements.items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link onClick={() => props.onSelectAdvertisement(p)}>
                      {p.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>
            No advertisements added. Create new by clicking "Add New" button
          </div>
        )}
      </DashboardContentWrapper>
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  onSelectAdvertisement: (advertisement: IGET_DASHBOARD_ADVERTISEMENT) => void;
  onCreateNew: () => void;
  onDeleteAll: () => void;
}
