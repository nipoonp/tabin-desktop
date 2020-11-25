import React, { useState, useEffect } from "react";
import {
  CREATE_ADVERTISEMENT,
  UPDATE_ADVERTISEMENT,
  DELETE_ADVERTISEMENT,
} from "../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import Input from "../../../tabin/components/input";
import { TextArea } from "../../../tabin/components/textArea";
import Select from "../../../tabin/components/select";
import * as yup from "yup";
import { Logger } from "aws-amplify";
import { PureQueryOptions } from "apollo-client/core/types";
import { toast } from "../../../tabin/components/toast";
import { FullScreenSpinner } from "../../../tabin/components/fullScreenSpinner";
import ImagePicker from "../../../tabin/components/imagePicker";
import DashboardHeaderEdit from "../dashboardHeaderEdit";
import FormFieldSeparator from "../formFieldSeparator";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_ADVERTISEMENT,
  IS3Image,
} from "../../../graphql/customQueries";

const logger = new Logger("AdvertisementForm");

const nameSchema = yup.string().required("Required");

export default (props: IProps) => {
  const { selectedAdvertisement } = props;
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const [name, setName] = useState(
    selectedAdvertisement ? selectedAdvertisement.name : ""
  );
  const [content, setContent] = useState<IS3Image | null>(null);

  const [nameError, setNameError] = useState("");

  const createAdvertisement = useMutation(CREATE_ADVERTISEMENT, {
    update: (proxy, mutationResult: any) => {
      toast.success("New advertisement successfully added");
      props.onAdvertisementActionComplete();
    },
    refetchQueries: props.refetchRestaurant,
  });

  const updateAdvertisement = useMutation(UPDATE_ADVERTISEMENT, {
    update: (proxy, mutationResult: any) => {
      toast.success("New advertisement successfully updated");
      props.onAdvertisementActionComplete();
    },
    refetchQueries: props.refetchRestaurant,
  });

  const deleteAdvertisement = useMutation(DELETE_ADVERTISEMENT, {
    update: () => {},
    refetchQueries: props.refetchRestaurant,
  });

  const onDelete = () => {
    setShowFullScreenSpinner(true);

    let promises: Promise<any>[] = [];

    if (props.selectedAdvertisement) {
      promises.push(
        deleteAdvertisement({
          variables: {
            id: props.selectedAdvertisement.id,
          },
        })
      );
    }

    Promise.all(promises)
      .then((values) => {
        toast.success("Advertisement successfully deleted");
        props.onAdvertisementActionComplete();
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
        let variables = {
          id: "Placeholder",
          name: name,
          content: content,
          advertisementRestaurantId: props.restaurant.id,
          owner: props.restaurant.restaurantManagerId,
        };

        if (props.selectedAdvertisement) {
          variables.id = props.selectedAdvertisement.id;
          delete variables.advertisementRestaurantId;
          delete variables.owner;

          return updateAdvertisement({ variables: variables });
        } else {
          delete variables.id;

          if (!content) {
            delete variables.content;
          }

          return createAdvertisement({ variables: variables });
        }
      })
      .catch(() => {
        setShowFullScreenSpinner(false);
      })
      .finally(() => setShowFullScreenSpinner(false));
  };

  const validateAllFields = () => {
    validateName();

    let promises: Promise<any>[] = [];

    promises.push(nameSchema.validate(name));

    return Promise.all(promises);
  };

  const validateName = () => {
    nameSchema
      .validate(name)
      .then(() => setNameError(""))
      .catch((error) => setNameError(error.errors));
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const onSetContent = (uploadedContent: IS3Image | null) => {
    setContent(uploadedContent);
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} />
      <DashboardHeaderEdit
        onBack={props.onAdvertisementActionComplete}
        onSave={onSubmit}
        onDelete={onDelete}
        showDelete={props.selectedAdvertisement ? true : false}
      />
      {/* <form onSubmit={handleSubmit} className={styles.formikForm}> */}
      {/* <DashboardContentWrapper> */}
      <Input
        title="Name"
        name="name"
        autoFocus={true}
        placeholder="Enter advertisement name"
        value={name}
        onChange={onChangeName}
        onBlur={validateName}
        error={nameError}
      />
      <FormFieldSeparator />
      <ImagePicker uploadedImage={content} setUploadedImage={onSetContent} />
      {/* </DashboardContentWrapper> */}
      {/* </form> */}
    </>
  );
};

interface IProps {
  restaurant: IGET_DASHBOARD_RESTAURANT;
  refetchRestaurant:
    | ((result: any) => (string | PureQueryOptions)[])
    | (string | PureQueryOptions)[]
    | undefined;
  selectedAdvertisement: IGET_DASHBOARD_ADVERTISEMENT | null;
  onAdvertisementActionComplete: () => void;
}
