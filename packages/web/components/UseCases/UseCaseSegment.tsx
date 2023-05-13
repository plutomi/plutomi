import { SegmentedControl, Flex, MediaQuery } from "@mantine/core";
import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

const useCases: UseCase[] = [
  "Employee Hiring",
  "Large Scale Contracting",
  "Social Services"
];

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();

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
        />
      </MediaQuery>
    </Flex>
  );
};
