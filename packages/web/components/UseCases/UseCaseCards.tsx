import {
  createStyles,
  Card,
  Text,
  SimpleGrid,
  UnstyledButton,
  Anchor,
  Group,
  rem
} from "@mantine/core";
import {
  IconCreditCard,
  IconBuildingBank,
  IconRepeat,
  IconReceiptRefund,
  IconReceipt
} from "@tabler/icons-react";
import { UseCase, useUseCaseStore } from "./useUseCaseStore";

type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
};

const hiringUseCase: UseCaseCard[] = [
  { title: "Resume Upload", icon: IconCreditCard, color: "gray" },
  { title: "Resume Review", icon: IconBuildingBank, color: "indigo" },
  { title: "Interviewing", icon: IconRepeat, color: "blue" },
  { title: "Rejected", icon: IconReceiptRefund, color: "red" },
  { title: "Hired", icon: IconReceipt, color: "green" }
];

const socialServicesUseCase: UseCaseCard[] = [
  { title: "Registration", icon: IconReceipt, color: "green" },
  { title: "ID Upload", icon: IconReceipt, color: "orange" },
  { title: "ID Verification", icon: IconReceipt, color: "indigo" },
  { title: "Registered", icon: IconReceipt, color: "indigo" },
  { title: "Did Not Qualify", icon: IconReceipt, color: "indigo" }
];

const largeScaleContractingUseCase: UseCaseCard[] = [
  { title: "Wait List", icon: IconReceipt, color: "gray" },
  { title: "Setup Profile", icon: IconReceipt, color: "orange" },
  { title: "Background Check", icon: IconReceipt, color: "blue" },
  { title: "Failed Check ", icon: IconReceipt, color: "red" },
  { title: "Ready to Drive", icon: IconReceipt, color: "green" }
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
      <item.icon color={theme.colors[item.color][6]} size="2rem" />
      <Text size="xs" mt={7}>
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
