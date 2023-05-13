import React from "react";
import { useDroppable } from "@dnd-kit/core";

export const TestDroppable = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable"
  });
  const style = {
    color: isOver ? "green" : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, border: "2px solid red", width: "100%" }}
    >
      {props.children}
    </div>
  );
};
