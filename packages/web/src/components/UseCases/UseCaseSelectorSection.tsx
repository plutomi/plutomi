import { Box, Stack, Center } from "@mantine/core";
import { UseCaseSelector } from "./UseCaseSelector";
import { UseCaseCardsSection } from "./UseCaseCardsSection";

// Component made so we can SSR it

export const UseCaseSelectorSection = () => {
  return (
    <Stack w="full" align="center" gap="xl">
      <Box>
        <Box hiddenFrom="md">
          <UseCaseSelector orientation="vertical" />
        </Box>
        <Box visibleFrom="md">
          <UseCaseSelector />
        </Box>
      </Box>

      <Box mt="xl">
        <UseCaseCardsSection />
      </Box>
    </Stack>
  );
};
