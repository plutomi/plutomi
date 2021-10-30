import create from "zustand";

const useStore = create((set) => ({
  // TODO this is stupidly gross!!!
  createOrgModalIsOpen: false,
  OpeningModalIsOpen: false,
  openingsSearchInput: "",
  createInviteModalIsOpen: false,

  applicantProfileModal: {
    is_modal_open: false,
  },

  setApplicantProfileModal: (applicantProfileModal) => {
    set((s) => ({
      applicantProfileModal: applicantProfileModal,
    }));
  },

  userProfileModal: {
    is_modal_open: false,
    modal_mode: "EDIT",
    first_name: "",
    last_name: "",
  },

  setUserProfileModal: (userProfileModal) => {
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
  setStageModal: (stageModal) => {
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
  setQuestionModal: (questionModal) => {
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
  setOpeningModal: (openingModal) => {
    set((state) => ({
      openingModal: openingModal,
    }));
  },

  setCreateOrgModalOpen: (open: Boolean) =>
    set((state) => ({
      createOrgModalIsOpen: open,
    })),

  setOpeningModalOpen: (open: Boolean) =>
    set((state) => ({
      OpeningModalIsOpen: open,
    })),

  setOpeningsSearchInput: (input: string) =>
    set((state) => ({
      openingsSearchInput: input,
    })),
  setCreateInviteModalOpen: (open: Boolean) =>
    set((state) => ({
      createInviteModalIsOpen: open,
    })),
}));
export default useStore;
