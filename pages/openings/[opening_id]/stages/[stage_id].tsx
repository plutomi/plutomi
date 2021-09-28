import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useStageById from "../../../../SWR/useStageById";
import SignIn from "../../../../components/SignIn";
import useUser from "../../../../SWR/useUser";
import { useEffect } from "react";
import GoBack from "../../../../components/GoBackButton";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { mutate } from "swr";
import useStore from "../../../../utils/store";
import { useState } from "react";
import useOpeningById from "../../../../SWR/useOpeningById";
import useAllStageQuestions from "../../../../SWR/useAllStageQuestions";
import CreateQuestionModal from "../../../../components/CreateQuestionModal";
export default function Stage() {
  const router = useRouter();
  const { stage_id, opening_id } = router.query;
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const setCreateQuestionModalOpen = useStore(
    (state: PlutomiState) => state.setCreateQuestionModalOpen
  );

  const { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening_id as string,
    stage_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(
      user?.org_id,
      opening_id as string,
      stage_id as string
    );

  const [new_questions, setNewQuestions] = useState(questions);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // No change
    if (!destination) {
      return;
    }

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setIsUpdating(true);

    let new_question_order = Array.from(stage.question_order);
    new_question_order.splice(source.index, 1);
    new_question_order.splice(destination.index, 0, draggableId);
    let new_order = new_question_order.map((i) =>
      questions.find((j) => j.question_id === i)
    );

    setNewQuestions(new_order);

    try {
      const body = {
        updated_stage: { ...stage, question_order: new_question_order },
      };

      await axios.put(`/api/openings/${opening_id}/stages/${stage_id}`, body);
    } catch (error) {
      alert(error.response.data.message);
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}/stages/${stage_id}`); // Refresh the question order
    setIsUpdating(false);
  };

  const updateStage = async (stage_id: string) => {
    try {
      const body = {
        updated_stage: {
          ...stage,
          GSI1SK: newName ? newName : opening.GSI1SK, // If not blank
        },
      };

      const { data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);
    setIsEditing(false);
    setNewName("");
  };

  const DeleteStage = async (stage_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this stage? THIS IS IRREVERSABLE!!!"
      )
    )
      return;
    try {
      const { data } = await axios.delete(
        `/api/openings/${opening_id}/stages/${stage_id}`
      );
      alert(data.message);
      router.push(`/openings/${opening_id}/stages`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stage_order
    mutate(`/api/openings/${opening_id}`);

    // Refresh the stage list
    mutate(`/api/openings/${opening_id}/stages`);
  };

  const createQuestion = async ({ question_title, question_description }) => {
    const body: APICreateQuestionInput = {
      question_title: question_title,
      question_description: question_description,
    };
    try {
      const { data } = await axios.post(
        `/api/openings/${opening_id}/stages/${stage_id}/questions`,
        body
      );
      alert(data.message);
      setCreateQuestionModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);

    // Refresh the question list
    mutate(
      `/api/orgs/${user.org_id}/openings/${opening_id}/stages/${stage_id}/questions`
    );
  };

  useEffect(() => {
    setNewQuestions(questions);
  }, [questions]);

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~LOADING STATES START~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`}
        desiredPage={"your openings"}
      />
    );
  }

  if (isUserLoading) {
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~LOADING STATES END~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  return (
    <div>
      <SignedInNav user={user} current={"Openings"} />
      <div className="mx-auto px-20 py-8">
        <div>
          <GoBack />
          <CreateQuestionModal createQuestion={createQuestion} />
          {stage ? (
            <div className="p-10">
              <h1 className="text-2xl font-bold">{stage.GSI1SK}</h1>
              <div className="m-4  flex flex-wrap max-w-full">
                <button
                  className="px-4 py-3 bg-red-500 m-4 text-white text-xl hover:bg-red-800"
                  onClick={() => DeleteStage(stage.stage_id)}
                >
                  Delete{" "}
                </button>
                <button
                  className="px-4 py-3 bg-sky-500 m-4 text-white text-xl hover:bg-sky-800"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Edit{" "}
                </button>

                <button
                  onClick={() => setCreateQuestionModalOpen(true)}
                  className="mx-auto flex justify-center items-center px-4 py-2 bg-green-700  rounded-lg text-white"
                >
                  + Add question
                </button>
              </div>

              <div className="m-4 border rounded-md p-4">
                <h1 className="text-lg">Question order Order</h1>
                <p>Total questions: {stage?.question_order?.length}</p>

                <p>Correct order: {JSON.stringify(stage?.question_order)}</p>

                <ul className="p-4">
                  {" "}
                  {stage?.question_order?.map((id) => (
                    <li key={id}>
                      {stage?.question_order?.indexOf(id) + 1}.
                      {new_questions
                        ? new_questions[stage?.question_order?.indexOf(id)]
                            ?.GSI1SK
                        : null}{" "}
                      -{" "}
                      {new_questions
                        ? new_questions[stage?.question_order?.indexOf(id)]
                            ?.question_id
                        : null}
                    </li>
                  ))}
                </ul>
              </div>
              {isEditing ? (
                <div className="max-w-xl my-2 mx-auto ">
                  <label
                    htmlFor="newName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Change name{" "}
                    {!newName || newName === stage.GSI1SK ? (
                      <span className="text-sm text-blue-gray-500">
                        - Name will stay the same
                      </span>
                    ) : null}
                  </label>
                  <div className="mt-1 space-y-4">
                    <input
                      type="text"
                      name="newName"
                      id="newName"
                      defaultValue={stage.GSI1SK}
                      // value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter your new name here"
                    />

                    <button
                      onClick={() => updateStage(stage.stage_id)}
                      className=" px-4 py-3 text-white bg-green-500 rounded-lg"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : null}

              {/** QUESTIONS START HERE */}
              {isUpdating ? (
                <h1 className="text-6xl font-bold m-8 text-center">
                  Updating...
                </h1>
              ) : null}

              <DragDropContext
                onDragEnd={handleDragEnd}
                onDragStart={() => console.log("Start")}
              >
                <Droppable droppableId={stage.stage_id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-12 flex rounded-md flex-col  mx-4 max-w-full border justify-center items-center"
                    >
                      {new_questions?.length > 0 ? (
                        new_questions?.map(
                          (question: DynamoStageQuestion, index: number) => {
                            return (
                              <Draggable
                                className="m-6 p-4 w-full max-w-xl bg-white"
                                key={question.question_id}
                                draggableId={question.question_id}
                                index={index}
                                {...provided.droppableProps}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <div
                                      key={question.question_id}
                                      className="p-4 border rounded-md shadow-md max-w-xl bg-white"
                                    >
                                      <h1 className="font-bold text-lg">
                                        {question.GSI1SK} -{" "}
                                        {question.question_id}
                                      </h1>
                                      <p className="text-sm text-blue-gray-500">
                                        {question.question_description}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          }
                        )
                      ) : isQuestionsLoading ? (
                        <h1>Loading...</h1>
                      ) : (
                        <h1>No questions found</h1>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : isStageLoading ? (
            <h1> Loading stage</h1>
          ) : (
            <h1>No stage found</h1>
          )}
        </div>
      </div>
    </div>
  );
}
