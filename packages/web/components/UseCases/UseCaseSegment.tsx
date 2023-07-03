import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

const useCases: UseCase[] = [
  "Employee Hiring",
  "Large Scale Contracting",
  "Social Services"
];

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();

  const isSelected = (title: UseCase) => useCase === title;
  return (
    <div
      className="flex space-x-1 rounded-lg bg-slate-200 p-0.5"
      role="tablist"
      aria-orientation="horizontal"
    >
      {useCases.map((title) => (
        <button
          onClick={() => {
            setUseCase(title);
          }}
          className={`flex items-center rounded-md py-[0.4375rem] px-4 text-lg text-slate-500 font-medium ${
            isSelected(title) ? "bg-white shadow text-slate-900 " : ""
          }`}
          role="tab"
          type="button"
          aria-selected="true"
        >
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
};
