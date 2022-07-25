import { DEFAULTS } from '../Config';

interface NameIsDefaultProps {
  firstName: string;
  lastName: string;
}
export const nameIsDefault = ({ firstName, lastName }: NameIsDefaultProps) => {
  const firstNameDefault = firstName === DEFAULTS.FIRST_NAME;
  const lastNameDefault = lastName === DEFAULTS.LAST_NAME;
  if (firstNameDefault && lastNameDefault) {
    return true;
  } else {
    return false;
  }
};
