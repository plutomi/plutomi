import { DEFAULTS } from '../../Config';
import { cleanup } from './cleanup';

interface NameIsDefaultProps {
  firstName: string;
  lastName: string;
}
export const nameIsDefault = ({ firstName, lastName }: NameIsDefaultProps) => {
  const firstNameDefault = cleanup(firstName) === cleanup(DEFAULTS.FIRST_NAME);
  const lastNameDefault = cleanup(lastName) === cleanup(DEFAULTS.LAST_NAME);
  if (firstNameDefault && lastNameDefault) {
    return true;
  } else {
    return false;
  }
};
