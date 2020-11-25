import React, { useState, useEffect } from "react";
import {
  CREATE_MODIFIER,
  UPDATE_MODIFIER,
  DELETE_MODIFIER,
  DELETE_MODIFIER_GROUP_MODIFIER_LINK,
  CREATE_MODIFIER_GROUP_MODIFIER_LINK,
  UPDATE_MODIFIER_GROUP_MODIFIER_LINK,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import Input from "../../../../tabin/components/input";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import Select from "../../../../tabin/components/select";
import {
  convertCentsToDollars,
  convertDollarsToCents,
} from "../../../../util/moneyConversion";
import * as yup from "yup";
import { Logger } from "aws-amplify";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../../tabin/components/toast";
import DashboardContentWrapper from "../../dashboardContentWrapper";
import DashboardHeaderEdit from "../../dashboardHeaderEdit";
import FormFieldSeparator from "../../formFieldSeparator";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_MODIFIER,
  IGET_DASHBOARD_MODIFIER_GROUP,
} from "../../../../graphql/customQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/fontawesome-free-solid";
import { Stepper } from "../../../../tabin/components/stepper";
import { Space2 } from "../../../../tabin/components/spaces";

const styles = require("./modifierDashboard.module.css");

const logger = new Logger("ModiferForm");

const nameSchema = yup.string().required("Required");
const priceSchema = yup.string().required("Required");

export default (props: IProps) => {
  const { selectedModifier } = props;
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedModifier ? selectedModifier.name : ""
  );
  const [price, setPrice] = useState(
    selectedModifier ? convertCentsToDollars(selectedModifier.price) : ""
  );

  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  //All the modifier groups we can select from
  let selectableModifierGroupList: PProps[] = [];

  props.restaurant.modifierGroups.items.map((mg) =>
    selectableModifierGroupList.push({
      value: mg.id,
      name: mg.name,
      preSelectedQuantity: 0,
    })
  );

  //The modifier groups which are currently selected against a modifier
  let currentSelectedModifierGroupList: PProps[] = [];

  props.selectedModifier &&
    props.selectedModifier.modifierGroups.items.map((mg) =>
      currentSelectedModifierGroupList.push({
        value: mg.modifierGroup.id,
        name: mg.modifierGroup.name,
        preSelectedQuantity: mg.preSelectedQuantity || 0,
      })
    );

  currentSelectedModifierGroupList.map(
    (selectedModifierGroup) =>
      (selectableModifierGroupList = selectableModifierGroupList.filter(
        (modifierGroup) => modifierGroup.value != selectedModifierGroup.value
      ))
  );

  let originalSelectedModifierGroups: PProps[] = [
    ...currentSelectedModifierGroupList,
  ];

  const [
    currentSelectedModifierGroups,
    setCurrentSelectedModifierGroups,
  ] = useState(currentSelectedModifierGroupList);
  const [selectableModifierGroups, setSelectableModifierGroups] = useState(
    selectableModifierGroupList
  );

  const createModifier = useMutation(CREATE_MODIFIER, {
    update: (proxy, mutationResult: any) => {
      const newModifierID = mutationResult.data.createModifier.id;

      reassignModifierGroupModifierLinks(
        originalSelectedModifierGroups,
        currentSelectedModifierGroups,
        newModifierID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateModifier = useMutation(UPDATE_MODIFIER, {
    update: (proxy, mutationResult: any) => {
      const newModifierID = mutationResult.data.updateModifier.id;

      reassignModifierGroupModifierLinks(
        originalSelectedModifierGroups,
        currentSelectedModifierGroups,
        newModifierID
      );
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteModifier = useMutation(DELETE_MODIFIER, {
    update: (proxy, mutationResult) => {},
    refetchQueries: props.refetchRestaurant,
  });

  const createModifierGroupModifierLink = useMutation(
    CREATE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const updateModifierGroupModifierLink = useMutation(
    UPDATE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const deleteModifierGroupModifierLink = useMutation(
    DELETE_MODIFIER_GROUP_MODIFIER_LINK,
    {
      update: (proxy, mutationResult) => {},
    }
  );

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedModifier) {
      props.selectedModifier.modifierGroups.items.map((mg) => {
        promises.push(
          deleteModifierGroupModifierLink({
            variables: {
              id: mg.id,
            },
          })
        );
      });

      deleteModifier({
        variables: {
          id: props.selectedModifier.id,
        },
      });
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("Modifier successfully deleted");
        props.onModifierActionComplete();
      })
      .catch((error) =>
        toast.error("There was an error processing you request")
      )
      .finally(() => setShowFullScreenSpinner(false));
  };

  const reassignModifierGroupModifierLinks = (
    originalSelectedModifierGroups: PProps[],
    currentSelectedModifierGroups: PProps[],
    newModifierID: string
  ) => {
    let promises: Promise<any>[] = [];

    let modifierGroupLinksToDelete = originalSelectedModifierGroups;
    let modifierGroupLinkToAdd = currentSelectedModifierGroups;
    let modifierGroupLinksToUpdate: PProps[] = [];

    modifierGroupLinksToDelete.map((originalModifierGroup: PProps) =>
      modifierGroupLinkToAdd.map((newModifierGroup: PProps) => {
        if (originalModifierGroup.value == newModifierGroup.value) {
          modifierGroupLinksToDelete = modifierGroupLinksToDelete.filter(
            (modifierGroup: PProps) =>
              modifierGroup.value != originalModifierGroup.value
          );

          modifierGroupLinkToAdd = modifierGroupLinkToAdd.filter(
            (modifierGroup: PProps) =>
              modifierGroup.value != originalModifierGroup.value
          );

          modifierGroupLinksToUpdate.push(newModifierGroup);
        }
      })
    );

    modifierGroupLinkToAdd.map((modifierGroup: PProps) =>
      promises.push(
        createModifierGroupModifierLink({
          variables: {
            modifierGroupModifierLinkModifierGroupId: modifierGroup.value,
            modifierGroupModifierLinkModifierId: newModifierID,
            displaySequence: 999,
            preSelectedQuantity: modifierGroup.preSelectedQuantity,
            owner: props.restaurant.restaurantManagerId,
          },
        })
      )
    );

    modifierGroupLinksToDelete.map(
      (modifierGroupDelete) =>
        props.selectedModifier &&
        props.selectedModifier.modifierGroups.items.map((mg) => {
          if (mg.modifierGroup.id == modifierGroupDelete.value) {
            promises.push(
              deleteModifierGroupModifierLink({
                variables: {
                  id: mg.id,
                },
              })
            );
          }
        })
    );

    modifierGroupLinksToUpdate.map(
      (modifierGroupUpdate) =>
        props.selectedModifier &&
        props.selectedModifier.modifierGroups.items.map((mg) => {
          if (
            mg.modifierGroup.id == modifierGroupUpdate.value &&
            mg.preSelectedQuantity != modifierGroupUpdate.preSelectedQuantity
          ) {
            promises.push(
              updateModifierGroupModifierLink({
                variables: {
                  id: mg.id,
                  preSelectedQuantity: modifierGroupUpdate.preSelectedQuantity,
                },
              })
            );
          }
        })
    );

    Promise.all(promises)
      .then((values) => {
        toast.success("New modifier successfully added");
        props.onModifierActionComplete();
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
        if (props.selectedModifier) {
          return updateModifier({
            variables: {
              id: props.selectedModifier.id,
              name: name,
              price: convertDollarsToCents(parseFloat(price)),
            },
          });
        } else {
          return createModifier({
            variables: {
              name: name,
              price: convertDollarsToCents(parseFloat(price)),
              modifierRestaurantId: props.restaurant.id,
              owner: props.restaurant.restaurantManagerId,
            },
          });
        }
      })
      .catch(() => {
        setShowFullScreenSpinner(false);
      });
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const handleSelectModifierGroup = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let selectedModifierGroup = selectableModifierGroups.filter(
      (category: PProps) => category.value == event.target.value
    );

    setCurrentSelectedModifierGroups([
      ...currentSelectedModifierGroups,
      selectedModifierGroup[0],
    ]);
    setSelectableModifierGroups(
      selectableModifierGroups.filter(
        (category: PProps) => category.value != event.target.value
      )
    );
  };

  const validateAllFields = () => {
    validateName();
    validatePrice();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));
    promises.push(priceSchema.validate(price));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const validatePrice = () => {
    priceSchema
      .validate(price)
      .then(() => setPriceError(""))
      .catch((error) => setPriceError(error.errors));
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onModifierActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedModifier ? true : false}
      />
      {/* <form onSubmit={onSubmit}> */}
      {/* <DashboardContentWrapper> */}
      <Input
        title="Modifier"
        name="name"
        autoFocus={true}
        placeholder="Enter modifier name"
        value={name}
        onChange={onChangeName}
        onBlur={validateName}
        error={nameError}
      />
      <FormFieldSeparator />
      <Input
        title="Price Adjustment"
        name="price"
        placeholder="Enter modifier price adjustment"
        type="number"
        value={price}
        onChange={onChangePrice}
        onBlur={validatePrice}
        error={priceError}
      />
      <FormFieldSeparator />
      <Select
        title="Modifier Group"
        // value={productOption}
        name="modifierGroupOption"
        onChange={handleSelectModifierGroup}
      >
        <option value="" label="Select a modifier group to apply modifier to" />
        {selectableModifierGroups.map((modifierGroupOption: PProps) => (
          <option
            key={modifierGroupOption.value}
            value={modifierGroupOption.value}
            label={modifierGroupOption.name}
          />
        ))}
      </Select>
      <FormFieldSeparator />
      <SelectedModifierModifierGroup
        currentSelectedModifierGroups={currentSelectedModifierGroups}
        setCurrentSelectedModifierGroups={setCurrentSelectedModifierGroups}
        selectableModifierGroups={selectableModifierGroups}
        setSelectableModifierGroups={setSelectableModifierGroups}
      />
      {/* </DashboardContentWrapper> */}
      {/* </form> */}
    </>
  );
};

const SelectedModifierModifierGroup = (
  props: ISelectedModifierModifierGroup
) => {
  const {
    currentSelectedModifierGroups,
    setCurrentSelectedModifierGroups,
    selectableModifierGroups,
    setSelectableModifierGroups,
  } = props;

  const removeSelectedModifierGroup = (modifierGroup: PProps) => {
    setSelectableModifierGroups([...selectableModifierGroups, modifierGroup]);
    setCurrentSelectedModifierGroups(
      currentSelectedModifierGroups.filter(
        (selectedModifierGroup: PProps) =>
          selectedModifierGroup.value != modifierGroup.value
      )
    );
    logger.debug(modifierGroup);
  };

  const updatePreSelectedQuantityForModifierGroup = (
    modifierGroup: PProps,
    preSelectedQuantity: number
  ) => {
    let newList = currentSelectedModifierGroups.filter(
      (selectedModifierGroup: PProps) =>
        selectedModifierGroup.value != modifierGroup.value
    );

    newList = [
      ...newList,
      {
        name: modifierGroup.name,
        value: modifierGroup.value,
        preSelectedQuantity: preSelectedQuantity,
      },
    ];

    setCurrentSelectedModifierGroups(newList);
    logger.debug(modifierGroup);
  };

  return (
    <div>
      {currentSelectedModifierGroups.map((modifierGroup: PProps) => (
        <>
          <div className={styles.modifierGroupModifierTagWrapper}>
            <div>
              <span className={styles.modifierGroupModifierTag}>
                {modifierGroup.name}
              </span>
              <span
                className={styles.modifierGroupModifierTagCross}
                onClick={() => removeSelectedModifierGroup(modifierGroup)}
              >
                <FontAwesomeIcon icon={faTimes as any} />
              </span>
            </div>
            <Space2 />
            <div style={{ display: "inline-block" }}>
              <Stepper
                count={modifierGroup.preSelectedQuantity}
                min={0}
                onUpdate={(count: number) =>
                  updatePreSelectedQuantityForModifierGroup(
                    modifierGroup,
                    count
                  )
                }
                size={24}
              />
            </div>
          </div>
        </>
      ))}
    </div>
  );
};

interface ISelectedModifierModifierGroup {
  currentSelectedModifierGroups: PProps[];
  setCurrentSelectedModifierGroups: (
    currentSelectedModifierGroups: PProps[]
  ) => void;
  selectableModifierGroups: PProps[];
  setSelectableModifierGroups: (selectableModifierGroups: PProps[]) => void;
}

interface PProps {
  value: string;
  name: string;
  preSelectedQuantity: number;
}

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
  selectedModifier: IGET_DASHBOARD_MODIFIER | null;
  onModifierActionComplete: () => void;
}
