import {
  createStyles,
  SegmentedControl,
  rem,
  Flex,
  MediaQuery
} from "@mantine/core";
import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.md,
    size: "xl",

    [theme.fn.smallerThan("lg")]: {
      size: "sm"
    },
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1]
    }`
  },

  indicator: {
    backgroundImage: theme.fn.gradient({ from: "pink", to: "orange" })
  },

  control: {
    border: "0 !important"
  },

  label: {
    "&, &:hover": {
      "&[data-active]": {
        color: theme.white
      }
    }
  }
}));

const useCases: UseCase[] = [
  "Employee Hiring",
  "Social Services",
  "Large Scale Contracting"
];

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();

  const { classes } = useStyles();
  return (
    <Flex justify="center">
      <SegmentedControl
        radius="xl"
        value={useCase}
        onChange={(value: UseCase) => {
          setUseCase(value);
        }}
        data={useCases}

      />
    </Flex>
  );
};
