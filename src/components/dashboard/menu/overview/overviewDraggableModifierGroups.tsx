import React, { useState } from "react";
import {
  Droppable,
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
  DropResult,
  DragDropContext,
} from "react-beautiful-dnd";
import {
  IDraggableModifierGroups,
  IDraggableProductCategories,
} from "./overviewDashboard";
import OverviewBarIcon from "./overviewBarIcon";
import OverviewDraggableModifiers from "./overviewDraggableModifiers";
import OverviewExpandIcon from "./overviewExpandIcon";

const styles = require("./overviewDraggableModifierGroups.module.css");

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): any => ({
  // width: "100%",
  // background: isDragging ? "#cccccc" : "#dddddd",
  // padding: "10px",
  // margin: "2px",
  // border: "1px solid grey",
  // borderRadius: "10px",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  // background: isDraggingOver ? "#dddddd" : "#eeeeee",
  // marginTop: "10px"
});

export default (props: IProps) => {
  const { productCategories, setProductCategories, reorder } = props;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const sourceParentId = result.source.droppableId;

    const sourceModifierGroupsTmp = productCategories.map((productCategory) =>
      productCategory.products.filter(
        (product) => product.id === sourceParentId
      )
    );

    const sourceModifierGroups: IDraggableModifierGroups[] = sourceModifierGroupsTmp.filter(
      (item) => item.length > 0
    )[0][0].modifierGroups;

    console.log("xxx...", sourceModifierGroupsTmp);
    console.log("xxx...", sourceModifierGroups);

    const reorderedModifierGroups = reorder(
      sourceModifierGroups,
      sourceIndex,
      destIndex
    );

    let newProductCategories = [...productCategories];

    newProductCategories = newProductCategories.map((productCategory) => {
      productCategory.products.map((product) => {
        if (product.id === sourceParentId) {
          product.modifierGroups = reorderedModifierGroups;
        }
      });

      return productCategory;
    });

    setProductCategories(newProductCategories);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={props.type}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {props.modifierGroups.map(
              (item: IDraggableModifierGroups, index: number) => (
                <DraggableModifierGroup
                  item={item}
                  index={index}
                  reorder={reorder}
                  productCategories={productCategories}
                  setProductCategories={setProductCategories}
                />
              )
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DraggableModifierGroup = (props: IDraggableModifierGroup) => {
  const {
    item,
    index,
    reorder,
    productCategories,
    setProductCategories,
  } = props;
  const [showChildren, setShowChildren] = useState(false);

  const onToggleChildren = () => {
    setShowChildren(!showChildren);
  };

  return (
    <>
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            <div className={styles.draggableItem}>
              <OverviewExpandIcon onClick={onToggleChildren} />
              <OverviewBarIcon provided={provided} />
              <div className={styles.contentWrapper}>
                <div>{item.content}</div>
                <div>
                  {item.modifiers.length}{" "}
                  {item.modifiers.length > 1 ? "modifiers" : "modifier"}
                </div>
              </div>
            </div>
            {showChildren && (
              <OverviewDraggableModifiers
                modifiers={item.modifiers}
                type={item.id}
                reorder={reorder}
                productCategories={productCategories}
                setProductCategories={setProductCategories}
              />
            )}
          </div>
        )}
      </Draggable>
    </>
  );
};

interface IProps {
  modifierGroups: IDraggableModifierGroups[];
  type: string;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}

interface IDraggableModifierGroup {
  item: IDraggableModifierGroups;
  index: number;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}
