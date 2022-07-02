/**
 * Given an array of child item ids and a position, this splices the array of
 * child item id's and returns the new order of the child items.
 * If no position is provided, item is added to the end of the list.
 *
 * Used for: Adding new stages to an opening, adding questions and rules to a stage.
 */
export default function getNewChildItemOrder(
  newItemId: string,
  childItemOrder: string[],
  position?: number,
) {
  const newPosition = !Number.isNaN(position) && position ? position : childItemOrder.length;
  childItemOrder.splice(newPosition, 0, newItemId);
  return childItemOrder;
}
