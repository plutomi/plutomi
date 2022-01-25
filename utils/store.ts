import create from "zustand";

const useStore = create((set) => ({
  /**
   * ORGS
   */
  /**
   * Whether the CreateOrgModal should be visible or not
   */
  showCreateOrgModal: false,
  openCreateOrgModal: () =>
    set(() => ({
      showCreateOrgModal: true,
    })),
  closeCreateOrgModal: () =>
    set(() => ({
      showCreateOrgModal: false,
    })),

  /**
   * OPENINGS
   */
  showCreateOpeningModal: false,
  openCreateOpeningModal: () =>
    set(() => ({
      showCreateOpeningModal: true,
    })),
  closeCreateOpeningModal: () =>
    set(() => ({
      showCreateOpeningModal: false,
    })),

  showUpdateOpeningModal: false,
  openUpdateOpeningModal: () =>
    set(() => ({
      showUpdateOpeningModal: true,
    })),
  closeUpdateOpeningModal: () =>
    set(() => ({
      showUpdateOpeningModal: false,
    })),

  showUserProfileModal: false,
  openUserProfileModal: () =>
    set(() => ({
      showUserProfileModal: true,
    })),
  closeUserProfileModal: () =>
    set(() => ({
      showUserProfileModal: false,
    })),

  /**
   * LEGACY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   */
  // TODO this is stupidly gross!!!
  openingsSearchInput: "",

  showInviteModal: false,
  openInviteModal: () =>
    set(() => ({
      showInviteModal: true,
    })),
  closeInviteModal: () =>
    set(() => ({
      showInviteModal: false,
    })),

  applicantProfileModal: {
    isModalOpen: false,
  },

  setApplicantProfileModal: (applicantProfileModal) => {
    set((s) => ({
      applicantProfileModal: applicantProfileModal,
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

  setOpeningsSearchInput: (input: string) =>
    set((state) => ({
      openingsSearchInput: input,
    })),
}));
export default useStore;
