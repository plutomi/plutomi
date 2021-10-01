import create from "zustand";

const useStore = create((set) => ({
  // TODO this is stupidly gross!!!
  createOrgModalIsOpen: false,
  createOpeningModalIsOpen: false,
  openingsSearchInput: "",
  createInviteModalIsOpen: false,

  userProfileModal: {
    is_modal_open: true,
    modal_mode: "EDIT",
    first_name: "",
    last_name: "",
  },

  setUserProfileModal: (userProfileModal: UserProfileModalInput) => {
    set((state) => ({
      userProfileModal: userProfileModal,
    }));
  },

  stageModal: {
    is_modal_open: false, // False by default
    modal_mode: "CREATE", // Will render text differently
    stage_id: "",
    GSI1SK: "", // Stage title
  },
  setStageModal: (stageModal: StageModalInput) => {
    set((state) => ({
      stageModal: stageModal,
    }));
  },

  questionModal: {
    is_modal_open: false, // False by default
    modal_mode: "CREATE", // Will render text differently
    question_id: "",
    GSI1SK: "", // Question title
    question_description: "",
  },
  setQuestionModal: (questionModal: QuestionModalInput) => {
    set((state) => ({
      questionModal: questionModal,
    }));
  },

  openingModal: {
    is_modal_open: false, // False by default
    modal_mode: "CREATE", // Will render text differently
    opening_id: "",
    GSI1SK: "",
    is_public: false,
  },
  setOpeningModal: (openingModal: OpeningModalInput) => {
    set((state) => ({
      openingModal: openingModal,
    }));
  },

  setCreateOrgModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createOrgModalIsOpen: open,
    })),

  setCreateOpeningModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createOpeningModalIsOpen: open,
    })),

  setOpeningsSearchInput: (input: string) =>
    set((state: PlutomiState) => ({
      openingsSearchInput: input,
    })),
  setCreateInviteModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createInviteModalIsOpen: open,
    })),
}));
export default useStore;
