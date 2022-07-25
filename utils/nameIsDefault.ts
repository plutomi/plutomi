import { DEFAULTS } from '../Config';

interface NameIsDefaultProps {
  firstName: string;
  lastName: string;
}
export const nameIsDefault = ({ firstName, lastName }: NameIsDefaultProps) => {
  const firstNameDefault =
    firstName.trim().toLowerCase() === DEFAULTS.FIRST_NAME.trim().toLowerCase();
  const lastNameDefault = lastName.trim().toLowerCase() === DEFAULTS.LAST_NAME.trim().toLowerCase();
  if (firstNameDefault && lastNameDefault) {
    return true;
  } else {
    return false;
  }
};
