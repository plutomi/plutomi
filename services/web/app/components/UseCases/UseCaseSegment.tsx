import { useEffect, useState } from "react";
import { UseCase, useUseCaseStore } from "~/hooks/use-usecase-store";

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();
  const [controlValue, setControlValue] = useState(useCase);

  useEffect(() => {
    setControlValue(useCase);
  }, [useCase]);

  const isSelected = (title: UseCase) => useCase === title;
  return (
    <div className=" flex justify-center flex-col lg:flex-row text-center space-x-0 lg:space-x-1 space-y-1 lg:space-y-0 rounded-[0.675rem] bg-slate-200  p-1 drop-shadow">
      {Object.values(UseCase).map((title) => (
        <button
          key={title}
          onClick={() => {
            setUseCase(title);
          }}
          className={`rounded-md py-3 px-4  text-slate-500 font-medium  ${
            isSelected(title)
              ? "bg-white drop-shadow-md text-slate-700 "
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
