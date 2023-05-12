import { Container, Stack } from "@mantine/core";
import { Commit, type CommitType } from "./Commit";

type LatestCommitsProps = {
  commits: CommitType[];
};

export const LatestCommits: React.FC<LatestCommitsProps> = ({ commits }) => (
  <Container size="md" style={{ border: "2px solid red" }}>
    <Stack spacing="md" style={{ border: "2px solid yellow"}}>
      {(commits ?? []).map((commit) => (
        <Commit key={commit.message} {...commit} />
      ))}
    </Stack>
  </Container>
);
