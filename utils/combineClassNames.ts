/**
 * Usage:
 * 
 *  <button className={classNames('this is always applied', 
        isTruthy && 'this only when the isTruthy is truthy', 
        active ? 'active classes' : 'inactive classes')}>Text</button>
 *  
 */
export default function combineClassNames(...classes: (false | null | undefined | string)[]) {
  return classes.filter(Boolean).join(' ');
}
