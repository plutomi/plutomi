"use client";
import {
  Button,
  Group,
  Text,
  List,
  ThemeIcon,
  rem,
  Title,
  Container,
  Stack
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

const MobileHeader = () => (
  <Stack align="start" hiddenFrom="md">
    <Text lh="1" fw={900} fz="60">
      Applicant management at{" "}
      <Text
        lh="1"
        fw={900}
        fz="60"
        span
        variant="gradient"
        gradient={{
          from: "rgba(38, 131, 224, 1)",
          to: "rgba(102, 150, 255, 1)",
          deg: 32
        }}
      >
        any scale
      </Text>
    </Text>
    <Text c="dimmed" ta="start" lh="1">
      Plutomi streamlines your application process with automated workflows
    </Text>
  </Stack>
);

const DesktopHeader = () => (
  <Stack align="center" visibleFrom="md">
    <Text lh="1" fw={900} fz="60">
      Applicant management at{" "}
      <Text
        lh="1"
        fw={900}
        fz="60"
        span
        variant="gradient"
        gradient={{
          from: "rgba(38, 131, 224, 1)",
          to: "rgba(102, 150, 255, 1)",
          deg: 32
        }}
      >
        any scale
      </Text>
    </Text>
    <Text c="dimmed" lh="1">
      Plutomi streamlines your application process with automated workflows
    </Text>
  </Stack>
);

export function HeaderMenu() {
  return (
    <div>
      <MobileHeader />
      <DesktopHeader />
    </div>
  );
}
