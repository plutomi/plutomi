import { UseCaseSegment } from "./UseCaseSegment";
import { useUseCaseStore, UseCase } from "@/hooks/useUseCaseStore";

export const UseCaseCards: React.FC = () => {
  const { useCase } = useUseCaseStore();

  const items = (Object.values(UseCase).get(useCase) ?? []).map((item) => (
    <div
      className=" rounded-lg bg-white drop-shadow-sm border"
      key={item.title}
    >
      <div className="flex flex-col items-center px-5 py-2">
        <item.icon size="2rem" className={`${item.color}`} />
        <p className="text-md font-medium text-slate-700">{item.title}</p>
      </div>

      <div className="flex border-t py-1 justify-center space-x-2 text-slate-500 font-light items-center ">
        <div className="text-slate-400">
          <HiUserGroup />
        </div>

        <div className="">
          <p className="">{item.amount.toLocaleString()} </p>
        </div>
      </div>
    </div>
  ));
};
