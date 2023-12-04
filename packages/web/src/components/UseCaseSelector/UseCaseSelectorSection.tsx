import { Box } from "@mantine/core";
import { UseCaseSelector } from "./UseCaseSelector";

export const UseCaseSelectorSection = () => {
  return (
    <>
      <Box hiddenFrom="md">
        <UseCaseSelector orientation="vertical" />
      </Box>
      <Box visibleFrom="md">
        <UseCaseSelector />
      </Box>
    </>
  );
};
