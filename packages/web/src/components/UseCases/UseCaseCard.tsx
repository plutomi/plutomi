import { Card, Box, Group, Text, Stack, Paper, Container } from "@mantine/core";
import React from "react";
import { HiUserGroup } from "react-icons/hi";

export type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
  amount: number;
};

export const UseCaseCard: React.FC<UseCaseCard> = (item) => {
  const { color, amount, title } = item;
  return (
    <Card shadow="sm" radius="md" withBorder py="lg" px="xl">
      <Stack align="center" gap="xs" justify="center">
        <item.icon size="2rem" color={color} />
        <Text fz="xs">{title}</Text>
      </Stack>

      <Card.Section withBorder mt="xs">
        <Group justify="center" c="dimmed" align="center">
          <HiUserGroup size={18} />
          <Text fz="xs">{amount.toLocaleString()}</Text>
        </Group>
      </Card.Section>
    </Card>
  );
};
