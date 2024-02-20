"use client";

import { useEffect, useState } from "react";
import { UseCase, useUseCaseStore } from "~/hooks/useUseCaseStore";

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();
  const [controlValue, setControlValue] = useState(useCase);

  useEffect(() => {
    setControlValue(useCase);
  }, [useCase]);

  const isSelected = (title: UseCase) => useCase === title;
  return (
    <div className="py-3">
      {Object.values(UseCase).map((title) => (
        <button
          key={title}
          onClick={() => {
            setUseCase(title);
          }}
          className={`rounded-md py-3 px-4 text-lg text-slate-500 font-medium  ${
            isSelected(title)
              ? "bg-white shadow-md text-slate-700 "
              : "hover:bg-slate-100 transition ease-in-out duration-100"
          }`}
          type="button"
        >
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
};
