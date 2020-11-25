import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
  DropResult
} from "react-beautiful-dnd";
import OverviewDraggableProducts from "./overviewDraggableProducts";
import OverviewBarIcon from "./overviewBarIcon";
import { IDraggableProductCategories } from "./overviewDashboard";
import { Logger } from "aws-amplify";
import OverviewExpandIcon from "./overviewExpandIcon";

const styles = require("./overviewDraggableProductCategories.module.css");
const logger = new Logger("OverviewDraggable");

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): any => ({
  // background: isDragging ? "#eeeeee" : "white",
  marginBottom: "20px",
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean) => ({
  // background: isDraggingOver ? "#eeeeee" : "lightgrey"
  // width: 500
});

export default (props: IProps) => {
  const { productCategories, setProductCategories } = props;

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const itemsReorder = reorder(productCategories, sourceIndex, destIndex);

    setProductCategories(itemsReorder);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {productCategories.map(
                (item: IDraggableProductCategories, index: number) => (
                  <DraggableProductCategory
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
    </>
  );
};

const DraggableProductCategory = (props: IDraggableProductCategory) => {
  const {
    item,
    index,
    reorder,
    productCategories,
    setProductCategories
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
                  {item.products.length}{" "}
                  {item.products.length > 1 ? "products" : "product"}
                </div>
              </div>
            </div>
            {showChildren && (
              <OverviewDraggableProducts
                products={item.products}
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
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}

interface IDraggableProductCategory {
  item: IDraggableProductCategories;
  index: number;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}
