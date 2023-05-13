import {
  SegmentedControl,
  Flex,
  MediaQuery,
  createStyles,
  rem
} from "@mantine/core";
import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

const useCases: UseCase[] = [
  "Employee Hiring",
  "Large Scale Contracting",
  "Social Services"
];

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.white,
    boxShadow: theme.shadows.md,
    border: `${rem(1)} solid ${theme.colors.gray[1]}`
  },

  indicator: {
    backgroundImage: theme.fn.gradient({
      from: theme.colors.indigo[6],
      to: theme.colors.indigo[4],
      deg: 20
    })
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

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();
  const { classes } = useStyles();

  return (
    <Flex justify="center">
      <MediaQuery smallerThan="md" styles={{ display: "none" }}>
        <SegmentedControl
          radius="lg"
          size="xl"
          value={useCase}
          onChange={(value: UseCase) => {
            setUseCase(value);
          }}
          data={useCases}
          classNames={classes}
        />
      </MediaQuery>
      <MediaQuery largerThan="md" styles={{ display: "none" }}>
        <SegmentedControl
          radius="lg"
          size="lg"
          orientation="vertical"
          value={useCase}
          onChange={(value: UseCase) => {
            setUseCase(value);
          }}
          data={useCases}
          classNames={classes}
        />
      </MediaQuery>
    </Flex>
  );
};
