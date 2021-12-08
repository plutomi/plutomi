import create from "zustand";
import * as Time from "./time";

const useStore = create((set) => ({
  // TODO this is stupidly gross!!!
  createOrgModalIsOpen: false,
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
    GSI1SK: "",
    isPublic: false,
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
