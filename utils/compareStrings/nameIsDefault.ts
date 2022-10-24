import { Defaults } from '../../Config';
import { cleanup } from './cleanup';

interface NameIsDefaultProps {
  firstName: string;
  lastName: string;
}
export const nameIsDefault = ({ firstName, lastName }: NameIsDefaultProps) => {
  const firstNameDefault = cleanup(firstName) === cleanup(Defaults.FirstName);
  const lastNameDefault = cleanup(lastName) === cleanup(Defaults.LastName);
  if (firstNameDefault && lastNameDefault) {
    return true;
  } else {
    return false;
  }
};
