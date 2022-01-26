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

  openingsSearchInput: "",
  setOpeningsSearchInput: (input: string) =>
    set((state) => ({
      openingsSearchInput: input,
    })),

  // TODO add applicant search input

  showInviteModal: false,
  openInviteModal: () =>
    set(() => ({
      showInviteModal: true,
    })),
  closeInviteModal: () =>
    set(() => ({
      showInviteModal: false,
    })),

  showCreateStageModal: false,
  openCreateStageModal: () =>
    set(() => ({
      showCreateStageModal: true,
    })),
  closeCreateStageModal: () =>
    set(() => ({
      showCreateStageModal: false,
    })),

  showUpdateStageModal: false,
  openUpdateStageModal: () =>
    set(() => ({
      showUpdateStageModal: true,
    })),
  closeUpdateStageModal: () =>
    set(() => ({
      showUpdateStageModal: false,
    })),

  showApplicantProfileModal: false,
  openApplicantProfileModal: () =>
    set(() => ({
      showApplicantProfileModal: true,
    })),
  closeApplicantProfileModal: () =>
    set(() => ({
      showApplicantProfileModal: false,
    })),
  /**
   * LEGACY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   */
  // TODO this is stupidly gross!!!

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
}));
export default useStore;
