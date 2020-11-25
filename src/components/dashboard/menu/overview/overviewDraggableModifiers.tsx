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
  IDraggableProductCategories,
  IDraggableModifiers,
} from "./overviewDashboard";
import OverviewBarIcon from "./overviewBarIcon";
import OverviewExpandIcon from "./overviewExpandIcon";

const styles = require("./overviewDraggableModifiers.module.css");

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

    const sourceModifiersTmp = productCategories.map((productCategory) =>
      productCategory.products.map((product) =>
        product.modifierGroups.filter(
          (modifierGroup) => modifierGroup.id === sourceParentId
        )
      )
    );

    const sourceModifiers: IDraggableModifiers[] = sourceModifiersTmp.filter(
      (item) => item.length > 0
    )[0][0];

    console.log("xxx...", sourceModifiersTmp);
    console.log("xxx...", sourceModifiers);

    const reorderedModifiers = reorder(sourceModifiers, sourceIndex, destIndex);

    let newProductCategories = [...productCategories];

    newProductCategories = newProductCategories.map((productCategory) => {
      productCategory.products.map((product) => {
        product.modifierGroups.map((modifierGroup) => {
          if (modifierGroup.id === sourceParentId) {
            modifierGroup.modifiers = reorderedModifiers;
          }
        });
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
            {props.modifiers.map((item: IDraggableModifiers, index: number) => (
              <DraggableModifier item={item} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DraggableModifier = (props: IDraggableModifier) => {
  const { item, index } = props;

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
              <OverviewBarIcon provided={provided} />
              <div className={styles.contentWrapper}>
                <div>{item.content}</div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
};

interface IProps {
  modifiers: IDraggableModifiers[];
  type: string;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}

interface IDraggableModifier {
  item: IDraggableModifiers;
  index: number;
}
