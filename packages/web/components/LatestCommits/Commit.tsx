import {
  createStyles,
  Avatar,
  Text,
  Group,
  Box,
  Card,
  Anchor,
  Flex,
  MediaQuery
} from "@mantine/core";
// TODO: Remove tabler icons
import { IconMail, IconMessage, IconChevronRight } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  icon: {
    marginTop: "auto",
    marginBottom: "auto",
    color:
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]
  },
  card: {
    boxShadow: theme.shadows.sm,
    transition: "box-shadow 150ms ease, transform 100ms ease",
    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
      cursor: "pointer"
    }
  }
}));

export type CommitType = {
  url: string;
  username: string;
  name: string;
  image: string;
  date: Date;
  email: string;
  message: string;
};

export const Commit: React.FC<CommitType> = ({
  url,
  username,
  name,
  message,
  image,
  date,
  email
}) => {
  const handleCardClick = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="group p-2 bg-white w-full max-w-3xl rounded-md shadow-md hover:shadow-lg transition ease-in-out duration-150 hover:scale-102 cursor-pointer">
      <div className="flex items-center">
        <div className="shrink-0">
          <img
            className="inline-block h-16 w-16 md:h-24 md:w-24 rounded-lg "
            src={image}
            alt={`@${username} GitHub avatar`}
          />
        </div>
        <div className="px-3 max-w-2xl">
          <p className="text-sm font-bold text-slate-400 group-hover:text-slate-500">
            {String(new Date(date).toLocaleDateString())}
          </p>
          <p className="text-lg font-medium text-slate-700 group-hover:text-slate-900">
            {name} -{" "}
            <span className="text-md  font-medium text-blue-400 hover:text-blue-600 hover:underline ">
              @{username}
            </span>
          </p>

          <p className="text-md font-light text-slate-500 group-hover:text-slate-700 line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>

    // <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
    //   <div className="flex border border-red-400">
    //     <div className="w-full border">
    //       <img
    //         className="h-full w-full"
    //         src={image}
    //         alt={`@${username} GitHub avatar`}
    //       />
    //     </div>

    //     <div className="p-8 border">
    //       <p className="mt-1 "> {name}</p>

    //       <a
    //         href="#"
    //         className="block mt-1 text-lg truncate font-medium text-black hover:underline"
    //       >
    //         @{username}
    //       </a>
    //       <p className="mt-2 text-slate-500">{message}</p>
    //     </div>
    //   </div>
    // </div>
  );
};

{
  /* </>
    <>
      <MediaQuery smallerThan="lg" styles={{ display: "none" }}>
        <Card
          className={classes.card}
          padding="sm"
          onClick={handleCardClick}
          shadow="sm"
          radius="md"
        >
          <Group noWrap>
            <Avatar src={image} size={94} radius="md" />

            <Box>
              <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                {String(new Date(date).toLocaleDateString())}
              </Text>
              <Text fz="lg" fw={500}>
                {name} -{" "}
                <Anchor
                  fz="lg"
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  @{username}
                </Anchor>
              </Text>

              <Group spacing="xs" noWrap>
                <IconMail stroke={1.5} size="1rem" className={classes.icon} />
                <Text fz="md" c="dimmed">
                  {email}
                </Text>
              </Group>

              <Group spacing="xs" noWrap>
                <Flex>
                  <IconMessage
                    stroke={1.5}
                    size="1rem"
                    className={classes.icon}
                  />
                </Flex>

                <Text fz="md" c="dimmed" lineClamp={1}>
                  {message.substring(0, 200)}
                </Text>
              </Group>
            </Box>

            <Box style={{ marginLeft: "auto" }}>
              <IconChevronRight size="1.2rem" stroke={1.5} />
            </Box>
          </Group>
        </Card>
      </MediaQuery>
      <MediaQuery largerThan="lg" styles={{ display: "none" }}>
        <Card
          className={classes.card}
          padding="sm"
          onClick={handleCardClick}
          shadow="sm"
          radius="md"
        >
          <Group noWrap>
            <Avatar src={image} size={94} radius="md" />

            <Box>
              <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                {String(new Date(date).toLocaleDateString())}
              </Text>
              <Text fz="lg" fw={500}>
                {name} -{" "}
                <Anchor
                  fz="lg"
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  @{username}
                </Anchor>
              </Text>
            </Box>

            <Box style={{ marginLeft: "auto" }}>
              <IconChevronRight size="1.2rem" stroke={1.5} />
            </Box>
          </Group>
          <Group spacing="xs" noWrap mt="xs">
            <IconMail stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="md" c="dimmed">
              {email}
            </Text>
          </Group>
          <Group spacing="xs" noWrap>
            <Flex>
              <IconMessage stroke={1.5} size="1rem" className={classes.icon} />
            </Flex>

            <Text fz="md" c="dimmed" lineClamp={2}>
              {message.substring(0, 200)}
            </Text>
          </Group>
        </Card>
      </MediaQuery>
    </> */
}
