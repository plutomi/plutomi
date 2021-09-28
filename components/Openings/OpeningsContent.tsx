import EmptyOpeningsState from "./EmptyOpeningsState";
export default function OpeningsContent({ user, openings }) {
  //   if (org_id === "NO_ORG_ASSIGNED") {
  //     return <EmptyOpeningsState />;
  //   }

  //   return <div>You&apos;re already in an org!</div>;

  if (openings.length === 0) {
    return <EmptyOpeningsState />;
  }

  return (
    <>
      {openings.map((opening: DynamoOpening) => {
        return <h1 key={opening.opening_id}>{opening.GSI1SK}</h1>;
      })}
    </>
  );
}
