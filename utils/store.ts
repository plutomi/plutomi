import create from "zustand";

const useStore = create((set) => ({
  // TODO this is stupidly gross!!!
  createOrgModalIsOpen: false,
  createOpeningModalIsOpen: false,
  createStageModalIsOpen: false,
  openingsSearchInput: "",
  createInviteModalIsOpen: false,

  questionModal: {
    is_open: false, // False by default
    modal_mode: "CREATE", // Will render text differently
    question_id: "",
    question_title: "",
    question_description: "",
  },
  setQuestionModal: (questionModal: QuestionModalInput) => {
    set((state) => ({
      questionModal: questionModal,
    }));
  },

  openingModal: {
    is_open: false, // False by default
    modal_mode: "CREATE", // Will render text differently
    opening_id: "",
    opening_name: "",
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
  setCreateStageModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createStageModalIsOpen: open,
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
