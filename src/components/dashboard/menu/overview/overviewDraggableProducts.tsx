import React, { useState } from "react";
import {
  Droppable,
  Draggable,
  DraggingStyle,
  NotDraggingStyle,
  DragDropContext,
  DropResult
} from "react-beautiful-dnd";
import {
  IDraggableProducts,
  IDraggableProductCategories
} from "./overviewDashboard";
import OverviewBarIcon from "./overviewBarIcon";
import OverviewDraggableModifierGroups from "./overviewDraggableModifierGroups";
import OverviewExpandIcon from "./overviewExpandIcon";

const styles = require("./overviewDraggableProducts.module.css");

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): any => ({
  // width: "100%",
  // background: isDragging ? "#dddddd" : "#eeeeee",
  // padding: "10px",
  // margin: "30px",
  // border: "1px solid grey",
  // borderRadius: "7px",
  marginBottom: "10px",
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean) => ({
  // background: isDraggingOver ? "#eeeeee" : "white",
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

    const sourceProducts: IDraggableProducts[] = productCategories.filter(
      productCategory => productCategory.id === sourceParentId
    )[0].products;

    const reorderedProducts = reorder(sourceProducts, sourceIndex, destIndex);

    let newItems = [...productCategories];

    newItems = newItems.map(item => {
      if (item.id === sourceParentId) {
        item.products = reorderedProducts;
      }

      return item;
    });

    setProductCategories(newItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={props.type}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {props.products.map((item: IDraggableProducts, index: number) => (
              <DraggableProduct
                item={item}
                index={index}
                reorder={reorder}
                productCategories={productCategories}
                setProductCategories={setProductCategories}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DraggableProduct = (props: IDraggableProduct) => {
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
                  {item.modifierGroups.length}{" "}
                  {item.modifierGroups.length > 1
                    ? "modifier groups"
                    : "modifier group"}
                </div>
              </div>
            </div>
            {showChildren && (
              <OverviewDraggableModifierGroups
                modifierGroups={item.modifierGroups}
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
  products: IDraggableProducts[];
  type: string;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}

interface IDraggableProduct {
  item: IDraggableProducts;
  index: number;
  reorder: (list: any[], startIndex: number, endIndex: number) => any[];
  productCategories: IDraggableProductCategories[];
  setProductCategories: (
    productCategories: IDraggableProductCategories[]
  ) => void;
}
