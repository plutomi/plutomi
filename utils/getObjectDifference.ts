import { transform, isEqual, isArray, isObject } from 'lodash';
/**
 * Find difference between two objects
 * https://davidwells.io/snippets/get-difference-between-two-objects-javascript
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
export default function GetObjectDifference(origObj: {}, newObj: {}): {} {
  function changes(newObj: {}, origObj: {}) {
    let arrayIndexCounter = 0;
    return transform(newObj, (result, value, key) => {
      if (!isEqual(value, origObj[key])) {
        const resultKey = isArray(origObj) ? (arrayIndexCounter += 1) : key;
        result[resultKey] =
          isObject(value) && isObject(origObj[key]) ? changes(value, origObj[key]) : value;
      }
    });
  }
  return changes(newObj, origObj);
}
