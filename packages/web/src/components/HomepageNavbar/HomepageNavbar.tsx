// import { IconChevronDown } from "@tabler/icons-react";
// import Link from "next/link";

type HeaderActionProps = {
  // links: Array<{
  //   link: string;
  //   label: string;
  //   links: Array<{ link: string; label: string }>;
  // }>;
};

export const HomepageNavbar: React.FC<HeaderActionProps> = () => (
  <div>Home Navbar</div>
);

// const items = links.map((link) => {
//   const menuItems = link.links?.map((item) => (
//     <Menu.Item key={item.link}>{item.label}</Menu.Item>
//   ));

//   if (menuItems.length > 0) {
//     return (
//       <Menu
//         key={link.label}
//         trigger="hover"
//         transitionProps={{ exitDuration: 0 }}
//         withinPortal
//       >
//         <Menu.Target>
//           <a
//             href={link.link}
//             className={classes.link}
//             onClick={(event) => {
//               event.preventDefault();
//             }}
//           >
//             <Center>
//               <span className={classes.linkLabel}>{link.label}</span>
//               <IconChevronDown size={rem(12)} stroke={1.5} />
//             </Center>
//           </a>
//         </Menu.Target>
//         <Menu.Dropdown>{menuItems}</Menu.Dropdown>
//       </Menu>
//     );
//   }

//   return (
//     <a
//       key={link.label}
//       href={link.link}
//       className={classes.link}
//       onClick={(event) => {
//         event.preventDefault();
//       }}
//     >
//       {link.label}
//     </a>
//   );
// });

// return (

// <Header height={HEADER_HEIGHT} sx={{ borderBottom: 0 }}>
//   <Container className={classes.inner} size="xl">
//     <Group>
//       <Burger
//         opened={opened}
//         onClick={toggle}
//         className={classes.burger}
//         size="sm"
//       />
//       {/* <MantineLogo size={28} /> */}
//     </Group>
//     {/* <Group spacing={5} className={classes.links}>
//       {items}
//     </Group> */}
//     <Group>
//       <Link href="/login" passHref>
//         <Button variant="default" radius="md" size="md">
//           Log In
//         </Button>
//       </Link>

//       <Link href="/signup" passHref>
//         <Button radius="md" size="md">
//           Sign Up
//         </Button>
//       </Link>
//     </Group>
//   </Container>
// </Header>
