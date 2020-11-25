import React, { useState } from "react";
import {
  IGET_DASHBOARD_RESTAURANT,
  IGET_DASHBOARD_MODIFIER_GROUP,
} from "../../../../graphql/customQueries";
import { PureQueryOptions } from "apollo-client/core/types";
import Papa from "papaparse";
import { Logger } from "aws-amplify";
import {
  CREATE_CATEGORY,
  CREATE_CATEGORY_PRODUCT_LINK,
  CREATE_PRODUCT,
  CREATE_PRODUCT_MODIFIER_GROUP_LINK,
  CREATE_MODIFIER_GROUP,
  CREATE_MODIFIER_GROUP_MODIFIER_LINK,
  CREATE_MODIFIER,
} from "../../dashboardGraphQL";
import { useMutation } from "react-apollo-hooks";
import {
  convertDollarsToCents,
  convertCentsToDollars,
} from "../../../../util/moneyConversion";
import { FullScreenSpinner } from "../../../../tabin/components/fullScreenSpinner";
import { toast } from "../../../../tabin/components/toast";
import { H4 } from "../../../../tabin/components/headings";
import { Space4, Space1 } from "../../../../tabin/components/spaces";
import { Link } from "../../../../tabin/components/link";
import { GrayColor } from "../../../../tabin/components/colors";
import { CloudUploadIcon } from "../../../../tabin/components/cloudUploadIcon";
import { CloudDownloadIcon } from "../../../../tabin/components/cloudDownloadIcon";
import categoryDashboard from "../category/categoryDashboard";

const logger = new Logger("importExportMenu");

// const styles = require("./favourites.module.css");

interface FileData {
  id: string;
  type: string;
  name: string;
  description: string;
  price: string;
  productType: string;
  choiceMin: string;
  choiceMax: string;
  choiceDuplicate: string;
  parentsArray: string[];
}

const ExportMenu = (props: { onExport: () => void }) => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ color: "#484848", marginRight: "24px" }}>
          <CloudDownloadIcon height="32px" />
        </div>
        <Link onClick={props.onExport}>Export Menu</Link>
      </div>
    </>
  );
};

const ImportMenu = (props: {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ color: "#484848)", marginRight: "24px" }}>
          <CloudUploadIcon height="32px" />
        </div>
        <div>
          <label htmlFor="file-import">
            <Link>Import Menu</Link>
          </label>
          <Space1 />
          <GrayColor style={{ lineHeight: "24px" }}>
            (Only CSV files supported)
          </GrayColor>
        </div>
      </div>
      <input
        id="file-import"
        style={{ display: "none" }}
        type="file"
        accept=".csv"
        onChange={props.onImport}
      />
    </>
  );
};

export const ImportExportMenu = (props: {
  restaurant: IGET_DASHBOARD_RESTAURANT;
}) => {
  const parentsMap = new Map();

  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const createCategory = useMutation(CREATE_CATEGORY);
  const createCategoryProductLink = useMutation(CREATE_CATEGORY_PRODUCT_LINK);
  const createProduct = useMutation(CREATE_PRODUCT);
  const createProductModifierGroupLink = useMutation(
    CREATE_PRODUCT_MODIFIER_GROUP_LINK
  );
  const createModifierGroup = useMutation(CREATE_MODIFIER_GROUP);
  const createModifierGroupModifierLink = useMutation(
    CREATE_MODIFIER_GROUP_MODIFIER_LINK
  );
  const createModifier = useMutation(CREATE_MODIFIER);

  const processFileImport = async (result: FileData[]) => {
    for (const item of result) {
      switch (item.type) {
        case "C":
          const categoryDisplaySequence: string = JSON.parse(
            JSON.stringify(item.parentsArray[0])
          ).ds;

          const createdCategory: any = await createCategory({
            variables: {
              categoryRestaurantId: props.restaurant.id,
              name: item.name,
              owner: props.restaurant.restaurantManagerId,
              displaySequence: parseInt(categoryDisplaySequence),
            },
          });

          parentsMap.set(item.id, createdCategory.data.createCategory.id);
          break;
        case "P":
          const createdProduct: any = await createProduct({
            variables: {
              productRestaurantId: props.restaurant.id,
              name: item.name,
              description: item.description || null,
              price: convertDollarsToCents(parseFloat(item.price)),
              owner: props.restaurant.restaurantManagerId,
            },
          });

          const createdProductId = createdProduct.data.createProduct.id;

          parentsMap.set(item.id, createdProductId);

          item.parentsArray.forEach((parentCategory) => {
            const parentCategoryString: string = JSON.stringify(parentCategory);
            const parentCategoryId = JSON.parse(parentCategoryString).parent;
            const parentCategoryDisplaySequence = JSON.parse(
              parentCategoryString
            ).ds;

            createCategoryProductLink({
              variables: {
                categoryProductLinkCategoryId: parentsMap.get(parentCategoryId),
                categoryProductLinkProductId: createdProductId,
                displaySequence: parseInt(parentCategoryDisplaySequence),
                owner: props.restaurant.restaurantManagerId,
              },
            });
          });

          break;
        case "MG":
          const createdModifierGroup: any = await createModifierGroup({
            variables: {
              modifierGroupRestaurantId: props.restaurant.id,
              name: item.name,
              choiceMin: item.choiceMin,
              choiceMax: item.choiceMax,
              choiceDuplicate: item.choiceDuplicate,
              owner: props.restaurant.restaurantManagerId,
            },
          });

          const createdModifierGroupId =
            createdModifierGroup.data.createModifierGroup.id;

          parentsMap.set(item.id, createdModifierGroupId);

          item.parentsArray.forEach((parentProduct) => {
            const parentProductString: string = JSON.stringify(parentProduct);
            const parentProductId = JSON.parse(parentProductString).parent;
            const parentProductDisplaySequence = JSON.parse(parentProductString)
              .ds;

            createProductModifierGroupLink({
              variables: {
                productModifierGroupProductId: parentsMap.get(parentProductId),
                productModifierGroupModifierGroupId: createdModifierGroupId,
                displaySequence: parseInt(parentProductDisplaySequence),
                owner: props.restaurant.restaurantManagerId,
              },
            });
          });
          break;
        case "M":
          const createdModifier: any = await createModifier({
            variables: {
              modifierRestaurantId: props.restaurant.id,
              name: item.name,
              price: convertDollarsToCents(parseFloat(item.price)),
              owner: props.restaurant.restaurantManagerId,
            },
          });

          const createdModifierId = createdModifier.data.createModifier.id;

          parentsMap.set(item.id, createdModifierId);

          item.parentsArray.forEach((parentModifierGroup) => {
            const parentModifierGroupString: string = JSON.stringify(
              parentModifierGroup
            );
            const parentModifierGroupId = JSON.parse(parentModifierGroupString)
              .parent;
            const parentModifierGroupDisplaySequence = JSON.parse(
              parentModifierGroupString
            ).ds;

            createModifierGroupModifierLink({
              variables: {
                modifierGroupModifierLinkModifierGroupId: parentsMap.get(
                  parentModifierGroupId
                ),
                modifierGroupModifierLinkModifierId: createdModifierId,
                displaySequence: parentModifierGroupDisplaySequence,
                owner: props.restaurant.restaurantManagerId,
              },
            });
          });
          break;
        default:
          break;
      }
    }
  };

  const onImportFileParseComplete = async (result: any) => {
    setShowFullScreenSpinner(true);

    try {
      await processFileImport(result.data);
      setShowFullScreenSpinner(false);
      toast.success("Menu successfully imported");
    } catch (e) {
      toast.error("There was an error importing the menu");
      logger.debug("e", e);
      setShowFullScreenSpinner(false);
    }
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) {
      toast.error("There was an error importing your menu");
      throw "Invalid file imported";
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target == null || e.target.result == null) {
        toast.error("There was an error importing your menu");
        throw "Unable to read file content";
      }

      const fileContent = e.target.result.toString();

      Papa.parse(fileContent, {
        header: true,
        // dynamicTyping: true,
        skipEmptyLines: true,
        complete: (
          result: Papa.ParseResult<unknown>,
          file?: File | undefined
        ) => {
          onImportFileParseComplete(result);
        },
        error: () => {
          logger.debug("error!");
          toast.error("There was an error importing your menu");
        },
        transform: (value, columnName) => {
          if (value && columnName == "id") {
            return parseInt(value);
          } else if (value && columnName == "parentsArray") {
            return JSON.parse(value);
          }

          return value;
        },
      });
    };

    reader.readAsBinaryString(files[0]);
  };

  const onExport = () => {
    const exportJson: {
      id: string;
      type: string;
      name: string;
      description: string;
      price: string;
      choiceMin: string;
      choiceMax: string;
      choiceDuplicate: string;
      parentsArray: string;
    }[] = [];

    const itemsMap = new Map();

    props.restaurant.categories.items.forEach((category) => {
      exportJson.push({
        id: itemsMap.size.toString(),
        type: "C",
        name: category.name,
        description: "",
        price: "",
        choiceMin: "",
        choiceMax: "",
        choiceDuplicate: "",
        parentsArray: `[{"ds":${category.displaySequence}}]`,
      });

      itemsMap.set(category.id, itemsMap.size.toString());
    });

    props.restaurant.products.items.forEach((product) => {
      exportJson.push({
        id: itemsMap.size.toString(),
        type: "P",
        name: product.name,
        description: product.description,
        price: convertCentsToDollars(product.price),
        choiceMin: "",
        choiceMax: "",
        choiceDuplicate: "",
        parentsArray:
          "[" +
          product.categories.items.map(
            (category) =>
              `{"parent":${itemsMap.get(category.category.id)},"ds":${
                category.displaySequence
              }}`
          ) +
          "]",
      });

      itemsMap.set(product.id, itemsMap.size.toString());
    });

    props.restaurant.modifierGroups.items.forEach((modifierGroup) => {
      exportJson.push({
        id: itemsMap.size.toString(),
        type: "MG",
        name: modifierGroup.name,
        description: "",
        price: "",
        choiceMin: String(modifierGroup.choiceMin),
        choiceMax: String(modifierGroup.choiceMax),
        choiceDuplicate: String(modifierGroup.choiceDuplicate),
        parentsArray:
          "[" +
          modifierGroup.products.items.map(
            (product) =>
              `{"parent":${itemsMap.get(product.product.id)},"ds":${
                product.displaySequence
              }}`
          ) +
          "]",
      });

      itemsMap.set(modifierGroup.id, itemsMap.size.toString());
    });

    props.restaurant.modifiers.items.forEach((modifier) => {
      exportJson.push({
        id: itemsMap.size.toString(),
        type: "M",
        name: modifier.name,
        description: "",
        price: convertCentsToDollars(modifier.price),
        choiceMin: "",
        choiceMax: "",
        choiceDuplicate: "",
        parentsArray:
          "[" +
          modifier.modifierGroups.items.map(
            (modifierGroup) =>
              `{"parent":${itemsMap.get(modifierGroup.modifierGroup.id)},"ds":${
                modifierGroup.displaySequence
              }}`
          ) +
          "]",
      });

      itemsMap.set(modifier.id, itemsMap.size.toString());
    });

    const csv = Papa.unparse(exportJson);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    var csvURL = window.URL.createObjectURL(csvData);

    var fileLink = document.createElement("a");
    fileLink.href = csvURL;
    fileLink.setAttribute("tabin", "tabin.csv");
    fileLink.click();
  };

  return (
    <>
      <FullScreenSpinner show={showFullScreenSpinner} text="Importing menu" />
      <H4>Menu Import/Export</H4>
      <Space4 />
      <ImportMenu onImport={onImport} />
      <Space4 />
      <ExportMenu onExport={onExport} />
    </>
  );
};
