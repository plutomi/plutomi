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
  IconReceipt,
  IconReceiptTax,
  IconReport,
  IconCashBanknote,
  IconCoin
} from "@tabler/icons-react";

type UseCase = {
  title: string;
  icon: React.FC<any>;
  color: string;
};

const hiringUseCase: UseCase[] = [
  { title: "Resume Upload", icon: IconCreditCard, color: "gray" },
  { title: "Resume Review", icon: IconBuildingBank, color: "indigo" },
  { title: "Interviewing", icon: IconRepeat, color: "blue" },
  { title: "Rejected", icon: IconReceiptRefund, color: "red" },
  { title: "Hired", icon: IconReceipt, color: "green" }
];

const useCases = hiringUseCase;

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
  const { classes, theme } = useStyles();

  const items = useCases.map((item) => (
    <UnstyledButton key={item.title} className={classes.item}>
      <item.icon color={theme.colors[item.color][6]} size="2rem" />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
  ));

  return (
    <SimpleGrid cols={5} mt="md">
      {items}
    </SimpleGrid>
  );
};
