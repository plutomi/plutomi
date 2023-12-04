"use client";
import { Text, SegmentedControl } from "@mantine/core";
import { useState } from "react";

enum UseCase {
  Hiring = "Employee Hiring",
  Contracting = "Large Scale Contracting",
  Services = "Social Services"
}

const CustomLabel: React.FC<{ label: UseCase }> = ({ label }) => (
  <Text fz="sm">{label}</Text>
);

const data = [
  {
    value: UseCase.Hiring,
    label: <CustomLabel label={UseCase.Hiring} />
  },
  {
    value: "Large Scale Contracting",
    label: <CustomLabel label={UseCase.Contracting} />
  },
  {
    value: "Social Services",
    label: <CustomLabel label={UseCase.Services} />
  }
];

export type UseCaseSelectorProps = {
  orientation?: "horizontal" | "vertical";
};
export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  orientation = "horizontal"
}) => {
  const [useCase, setUseCase] = useState(UseCase.Hiring);

  return (
    <SegmentedControl
      size="md"
      orientation={orientation}
      radius="md"
      onChange={(v) => setUseCase(v as UseCase)}
      data={data}
      value={useCase}
    />
  );
};
