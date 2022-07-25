interface EmailIsTheSameProps {
  email1: string;
  email2: string;
}

export const emailIsTheSame = ({ email1, email2 }) => {
  const clean1 = email1.trim().toLowerCase();
  const clean2 = email2.trim().toLowerCase();

  if (clean1 === clean2) {
    return true;
  } else {
    return false;
  }
};
