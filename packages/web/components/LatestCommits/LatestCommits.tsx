import { Container, Stack } from "@mantine/core";
import { Commit, type CommitType } from "./Commit";

type LatestCommitsProps = {
  commits: CommitType[];
};

export const LatestCommits: React.FC<LatestCommitsProps> = ({ commits }) => (
  <Container size="md">
    <Stack spacing="md">
      {(commits ?? []).map((commit) => (
        <Commit key={commit.message} {...commit} />
      ))}
    </Stack>
  </Container>
);
