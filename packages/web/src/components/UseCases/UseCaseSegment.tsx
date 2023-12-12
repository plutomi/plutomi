import { UseCase, useUseCaseStore } from "@/hooks/useUseCaseStore";

export const UseCaseSegment: React.FC = () => {
  const { useCase, setUseCase } = useUseCaseStore();

  const isSelected = (title: UseCase) => useCase === title;
  return (
    <div className="flex flex-col lg:flex-row text-center space-x-0 lg:space-x-1 space-y-1 lg:space-y-0 rounded-lg bg-slate-200 p-1 shadow-sm">
      {Object.values(UseCase).map((title) => (
        <button
          key={title}
          onClick={() => {
            setUseCase(title);
          }}
          className={`rounded-md py-3 px-4 text-lg text-slate-500 font-medium ${
            isSelected(title) ? "bg-white shadow-md text-slate-800 " : ""
          }`}
          type="button"
        >
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
};
