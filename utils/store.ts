import create from "zustand";

const useStore = create((set) => ({
  createOrgModalVisible: false,
  openCreateOrgModal: () =>
    set(() => ({
      createOrgModalVisible: true,
    })),
  closeCreateOrgModal: () =>
    set(() => ({
      createOrgModalVisible: false,
    })),

  // TODO this is stupidly gross!!!
  OpeningModalIsOpen: false,
  openingsSearchInput: "",
  createInviteModalIsOpen: false,

  applicantProfileModal: {
    isModalOpen: false,
  },

  setApplicantProfileModal: (applicantProfileModal) => {
    set((s) => ({
      applicantProfileModal: applicantProfileModal,
    }));
  },

  userProfileModal: {
    isModalOpen: false,
    modalMode: "EDIT",
    firstName: "",
    lastName: "",
  },

  setUserProfileModal: (userProfileModal) => {
    set((state) => ({
      userProfileModal: userProfileModal,
    }));
  },

  stageModal: {
    isModalOpen: false, // False by default
    modalMode: "CREATE", // Will render text differently
    stageId: "",
    GSI1SK: "", // Stage title
  },
  setStageModal: (stageModal) => {
    set((state) => ({
      stageModal: stageModal,
    }));
  },

  questionModal: {
    isModalOpen: false, // False by default
    modalMode: "CREATE", // Will render text differently
    questionId: "",
    GSI1SK: "", // Question title
    questionDescription: "",
  },
  setQuestionModal: (questionModal) => {
    set((state) => ({
      questionModal: questionModal,
    }));
  },

  openingModal: {
    isModalOpen: false, // False by default
    modalMode: "CREATE", // Will render text differently
    openingId: "",
    openingName: "",
    GSI1SK: "PRIVATE",
  },
  setOpeningModal: (openingModal) => {
    set((state) => ({
      openingModal,
    }));
  },

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
