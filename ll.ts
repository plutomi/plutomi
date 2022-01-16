import { isNonNullChain } from "typescript";
import { JOI_GLOBAL_FORBIDDEN } from "./Config";
// Thinking if something like this should be the way to sort stages

const main = async () => {
  let stages = [];

  const questionnaire = {
    name: "Questionnaire",
    nextItem: "Setup Profile",
    previousItem: "Interested?",
  };

  stages.push(questionnaire);

  let setupProfile = {
    name: "Setup Profile",
    nextItem: "Rules Stage",
    previousItem: "Questionnaire",
  };
  stages.push(setupProfile);

  let ruleStage = {
    name: "Rules Stage",
    nextItem: "On Hold",
    previousItem: "Setup Profile",
  };

  stages.push(ruleStage);

  let waitList = {
    name: "Waitlist",
    nextItem: "Interested?",
    previousItem: null,
  };

  stages.push(waitList);

  let interested = {
    name: "Interested?",
    nextItem: "Questionnaire",
    previousItem: "Waitlist",
  };
  stages.push(interested);

  let finalStage = {
    name: "On Hold",
    nextItem: null,
    previousItem: "Rules Stage",
  };

  stages.push(finalStage);

  console.log(stages);

  const first = stages.find((stage) => stage.previousItem === null);
  const last = stages.find((stage) => stage.nextItem === null);

  let ordered = [first];
  let current = stages.find((stage) => stage.name === first.nextItem);

  while (current.nextItem) {
    const nextItem = stages.find((stage) => stage.name === current.nextItem);
    ordered.push(current);
    current = nextItem;
  }

  ordered.push(last);
  ordered.forEach((item) => {
    console.log(`${ordered.indexOf(item) + 1}. ${item.name}`);
  });
};

main();
