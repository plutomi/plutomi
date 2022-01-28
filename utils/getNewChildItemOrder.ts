/**
 * Given an array of child item ids and a position, this splices the array of
 * child item id's and return the new order for the child items.
 * If no position is provided, item is added to the end of the list
 */

export default function getNewChildItemOrder(
  newItemId: string,
  childItemOrder: string[],
  position?: number
) {
  const newPosition = !isNaN(position) ? position : childItemOrder.length;
  childItemOrder.splice(newPosition, 0, newItemId);
  return childItemOrder;
}
