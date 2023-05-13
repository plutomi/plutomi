import {
  createStyles,
  Text,
  SimpleGrid,
  rem,
  Card,
  Group,
  Center
} from "@mantine/core";
import { IconReceipt, IconFileUpload } from "@tabler/icons-react";
import { SiCodereview } from "react-icons/si";
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
import { type UseCase, useUseCaseStore } from "./useUseCaseStore";

type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
  amount: number;
};

const hiringUseCase: UseCaseCard[] = [
  { title: "Resume Upload", icon: IconFileUpload, color: "gray", amount: 6 },
  { title: "Resume Review", icon: SiCodereview, color: "yellow", amount: 24 },
  { title: "Interviewing", icon: FaPeopleArrows, color: "blue", amount: 5 },
  { title: "Rejected", icon: AiFillCloseCircle, color: "red", amount: 59 },
  { title: "Hired", icon: MdOutlineWork, color: "green", amount: 2 }
];

const socialServicesUseCase: UseCaseCard[] = [
  { title: "Registration", icon: FaWpforms, color: "gray", amount: 430 },
  {
    title: "ID Verification",
    icon: BsFillPersonVcardFill,
    color: "yellow",
    amount: 31
  },
  {
    title: "Income Verification",
    icon: AiFillDollarCircle,
    color: "yellow",
    amount: 63
  },
  {
    title: "Did Not Qualify",
    icon: BsPersonFillExclamation,
    color: "red",
    amount: 27
  },
  {
    title: "Funds Disbursed",
    icon: GiReceiveMoney,
    color: "green",
    amount: 216
  }
];

const largeScaleContractingUseCase: UseCaseCard[] = [
  {
    title: "Wait List",
    icon: AiOutlineFieldTime,
    color: "gray",
    amount: 89587
  },
  { title: "Setup Profile", icon: IconReceipt, color: "yellow", amount: 12615 },
  {
    title: "Background Check",
    icon: BsPersonBoundingBox,
    color: "orange",
    amount: 948
  },
  { title: "Failed Check ", icon: BsPersonXFill, color: "red", amount: 27 },
  { title: "Ready to Drive", icon: FaCarSide, color: "green", amount: 3926 }
];

const useCases = new Map<UseCase, UseCaseCard[]>([
  ["Employee Hiring", hiringUseCase],
  ["Large Scale Contracting", largeScaleContractingUseCase],
  ["Social Services", socialServicesUseCase]
]);

const useStyles = createStyles((theme) => ({
  card: {
    boxShadow: theme.shadows.sm,

    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
  },
  section: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`
  },

  title: {
    fontWeight: 700
  },

  item: {
    display: "flex",
    borderRadius: theme.radius.md,

    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)"
    }
  },
  grid: {
    width: "80%",
    [theme.fn.smallerThan("lg")]: {
      width: "60%"
    }
  }
}));

export const UseCaseCards: React.FC = () => {
  const { useCase } = useUseCaseStore();
  const { classes, theme } = useStyles();

  const items = (useCases.get(useCase) ?? []).map((item) => (
    <Card key={item.title} className={classes.card} radius="md">
      <Card.Section py="xs">
        <Center>
          <item.icon color={theme.colors[item.color][5]} size="2rem" />
        </Center>
        <Text fz="lg" mt={4} ta="center">
          {item.title}
        </Text>
      </Card.Section>
      <Card.Section withBorder py="1">
        <Group spacing="xs" position="center" c="dimmed">
          <Center>
            <HiUserGroup />
          </Center>
          <Text fz="md" fw={500} py={4}>
            {item.amount.toLocaleString()}{" "}
          </Text>
        </Group>
      </Card.Section>
    </Card>
  ));

  return (
    <SimpleGrid
      breakpoints={[
        { maxWidth: "sm", cols: 1, spacing: "xs" },
        { minWidth: "lg", cols: 5, spacing: "xs" }
      ]}
      className={classes.grid}
    >
      {items}
    </SimpleGrid>
  );
};
