import {
  createStyles,
  Text,
  SimpleGrid,
  UnstyledButton,
  rem
} from "@mantine/core";
import {
  IconCreditCard,
  IconBuildingBank,
  IconRepeat,
  IconReceiptRefund,
  IconReceipt,
  IconFileUpload
} from "@tabler/icons-react";
import { SiCodereview } from "react-icons/si";
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
import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
};

const hiringUseCase: UseCaseCard[] = [
  { title: "Resume Upload", icon: IconFileUpload, color: "gray" },
  { title: "Resume Review", icon: SiCodereview, color: "yellow" },
  { title: "Interviewing", icon: FaPeopleArrows, color: "blue" },
  { title: "Rejected", icon: AiFillCloseCircle, color: "red" },
  { title: "Hired", icon: MdOutlineWork, color: "green" }
];

const socialServicesUseCase: UseCaseCard[] = [
  { title: "Registration", icon: FaWpforms, color: "gray" },
  { title: "ID Verification", icon: BsFillPersonVcardFill, color: "yellow" },
  { title: "Income Verification", icon: AiFillDollarCircle, color: "yellow" },
  { title: "Did Not Qualify", icon: BsPersonFillExclamation, color: "red" },
  { title: "Funds Disbursed", icon: GiReceiveMoney, color: "green" }
];

const largeScaleContractingUseCase: UseCaseCard[] = [
  { title: "Wait List", icon: AiOutlineFieldTime, color: "gray" },
  { title: "Setup Profile", icon: IconReceipt, color: "yellow" },
  { title: "Background Check", icon: BsPersonBoundingBox, color: "orange" },
  { title: "Failed Check ", icon: BsPersonXFill, color: "red" },
  { title: "Ready to Drive", icon: FaCarSide, color: "green" }
];

const useCases = new Map<UseCase, UseCaseCard[]>([
  ["Employee Hiring", hiringUseCase],
  ["Social Services", socialServicesUseCase],
  ["Large Scale Contracting", largeScaleContractingUseCase]
]);

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0]
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: rem(90),
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)"
    }
  }
}));

export const UseCaseCards: React.FC = () => {
  const { useCase } = useUseCaseStore();
  const { classes, theme } = useStyles();

  const items = (useCases.get(useCase) ?? []).map((item) => (
    <UnstyledButton key={item.title} className={classes.item}>
      <item.icon color={theme.colors[item.color][5]} size="2rem" />
      <Text size="sm" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
  ));

  return (
    <SimpleGrid
      breakpoints={[
        { maxWidth: "sm", cols: 1, spacing: "sm" },
        { minWidth: "md", cols: 5, spacing: "md" }
      ]}
    >
      {items}
    </SimpleGrid>
  );
};
