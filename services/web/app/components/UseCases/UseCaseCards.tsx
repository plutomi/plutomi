import { IconFileUpload } from "@tabler/icons-react";
import { FaPeopleArrows, FaCarSide, FaWpforms } from "react-icons/fa";
import {
  AiFillCloseCircle,
  AiOutlineFieldTime,
  AiFillDollarCircle
} from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";
import {
  BsPersonXFill,
  BsPersonBoundingBox,
  BsFillPersonVcardFill,
  BsPersonFillExclamation
} from "react-icons/bs";
import { MdOutlineWork } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { ImProfile } from "react-icons/im";
import { UseCase, useUseCaseStore } from "~/hooks/use-usecase-store";
import { PiListMagnifyingGlassBold } from "react-icons/pi";

type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
  amount: number;
};

const hiringUseCase: UseCaseCard[] = [
  {
    title: "Resume Upload",
    icon: IconFileUpload,
    color: "text-slate-400",
    amount: 6
  },
  {
    title: "Resume Review",
    icon: PiListMagnifyingGlassBold,
    color: "text-yellow-400",
    amount: 24
  },
  {
    title: "Interviewing",
    icon: FaPeopleArrows,
    color: "text-blue-500",
    amount: 5
  },
  {
    title: "Rejected",
    icon: AiFillCloseCircle,
    color: "text-red-500",
    amount: 59
  },
  { title: "Hired", icon: MdOutlineWork, color: "text-green-500", amount: 2 }
];

const socialServicesUseCase: UseCaseCard[] = [
  {
    title: "Registration",
    icon: FaWpforms,
    color: "text-slate-400",
    amount: 89
  },
  {
    title: "ID Verification",
    icon: BsFillPersonVcardFill,
    color: "text-yellow-400",
    amount: 174
  },
  {
    title: "Income Verification",
    icon: AiFillDollarCircle,
    color: "text-yellow-400",
    amount: 220
  },
  {
    title: "Did Not Qualify",
    icon: BsPersonFillExclamation,
    color: "text-red-500",
    amount: 27
  },
  {
    title: "Funds Disbursed",
    icon: GiReceiveMoney,
    color: "text-green-500",
    amount: 740
  }
];

const largeScaleContractingUseCase: UseCaseCard[] = [
  {
    title: "Wait List",
    icon: AiOutlineFieldTime,
    color: "text-slate-400",
    amount: 89587
  },
  {
    title: "Setup Profile",
    icon: ImProfile,
    color: "text-yellow-400",
    amount: 12615
  },
  {
    title: "Background Check",
    icon: BsPersonBoundingBox,
    color: "text-orange-400",
    amount: 948
  },
  {
    title: "Failed Check ",
    icon: BsPersonXFill,
    color: "text-red-500",
    amount: 27
  },
  {
    title: "Ready to Drive",
    icon: FaCarSide,
    color: "text-green-500",
    amount: 3926
  }
];

export const useCases = new Map<UseCase, UseCaseCard[]>([
  [UseCase.Hiring, hiringUseCase],
  [UseCase.Contracting, largeScaleContractingUseCase],
  [UseCase.Services, socialServicesUseCase]
]);

export const UseCaseCards: React.FC = () => {
  const { useCase } = useUseCaseStore();

  const items = (useCases.get(useCase) ?? []).map((item) => (
    <div className="rounded-lg bg-white drop-shadow-md " key={item.title}>
      <div className="flex flex-col items-center px-5 py-2">
        <item.icon size="2rem" className={`${item.color}`} />
        <p className="text-md font-medium text-slate-700">{item.title}</p>
      </div>

      <div className="flex border-t border-slate-300 py-1 justify-center space-x-2 text-slate-500 font-light items-center ">
        <div className="text-slate-400">
          <HiUserGroup />
        </div>

        <div className="">
          <p className="">{item.amount.toLocaleString()} </p>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full">{items}</div>
  );
};
