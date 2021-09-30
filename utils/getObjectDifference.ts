import { inspect } from "util";
import { transform, isEqual, isArray, isObject } from "lodash";
/**
 * Find difference between two objects
 * https://davidwells.io/snippets/get-difference-between-two-objects-javascript
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
export default function difference(origObj: {}, newObj: {}): {} {
  function changes(newObj: {}, origObj: {}) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value;
      }
    });
  }
  return changes(newObj, origObj);
}

/* Usage */

// const originalObject = {
//   foo: "bar",
//   baz: "fizz",
//   cool: true,
//   what: {
//     one: "one",
//     two: "two",
//   },
//   wow: {
//     deep: {
//       key: ["a", "b", "c"],
//       values: "123",
//     },
//   },
//   array: ["lol", "hi", "there"],
// };

// const newObject = {
//   foo: "bar",
//   baz: "fizz",
//   cool: false, // <-- diff
//   what: {
//     one: "one",
//     two: "twox", // <-- diff
//   },
//   wow: {
//     deep: {
//       key: ["x", "y", "c"], // <-- diff
//       values: "098", // <-- diff
//     },
//   },
//   array: ["lol", "hi", "difference"], // <-- diff
// };

// Get the Diff!
// const diff = difference(originalObject, newObject);

// console.log(inspect(diff, { showHidden: false, depth: null, colors: true }));
/* result:
{
  cool: false,
  what: { two: 'twox' },
  wow: { deep: { key: [ 'x', 'y' ], values: '098' } },
  array: [ 'difference' ]
}
*/
