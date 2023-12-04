"use client";
import { SimpleGrid } from "@mantine/core";
import { IconFileUpload } from "@tabler/icons-react";
import { SiCodereview } from "react-icons/si";
import { ImProfile } from "react-icons/im";
import { FaPeopleArrows, FaCarSide, FaWpforms } from "react-icons/fa";
import {
  AiFillCloseCircle,
  AiOutlineFieldTime,
  AiFillDollarCircle
} from "react-icons/ai";
import {
  BsPersonXFill,
  BsPersonBoundingBox,
  BsFillPersonVcardFill,
  BsPersonFillExclamation
} from "react-icons/bs";
import { MdOutlineWork } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { UseCase, useUseCaseStore } from "@/hooks/useUseCaseStore";

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
    icon: SiCodereview,
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

const useCases = new Map<UseCase, UseCaseCard[]>([
  [UseCase.Hiring, hiringUseCase],
  [UseCase.Contracting, largeScaleContractingUseCase],
  [UseCase.Services, socialServicesUseCase]
]);

export const UseCaseCardsSection: React.FC = () => {
  const { useCase } = useUseCaseStore();
  return (
    <SimpleGrid cols={5} spacing="xs">
      {useCases.get(useCase)!.map((card, idx) => (
        <div>
          {card.title} - {idx}
        </div>
      ))}
    </SimpleGrid>
  );
};
