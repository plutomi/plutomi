// @ts-nocheck // TODO remove

import create from 'zustand';
import { DynamoQuestion, DynamoWebhook } from '../types/dynamo';

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

  openingsSearchInput: '',
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

  showCreateWebhookModal: false,
  openCreateWebhookModal: () =>
    set(() => ({
      showCreateWebhookModal: true,
    })),
  closeCreateWebhookModal: () =>
    set(() => ({
      showCreateWebhookModal: false,
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

  showCreateQuestionModal: false,

  openCreateQuestionModal: () =>
    set(() => ({
      showCreateQuestionModal: true,
    })),
  closeCreateQuestionModal: () =>
    set(() => ({
      showCreateQuestionModal: false,
    })),

  showUpdateQuestionModal: false,
  openUpdateQuestionModal: () =>
    set(() => ({
      showUpdateQuestionModal: true,
    })),
  closeUpdateQuestionModal: () =>
    set(() => ({
      showUpdateQuestionModal: false,
    })),
  // Since questions do not have their own page, we have to do this for passing state around :(
  currentQuestion: undefined,
  setCurrentQuestion: (question: DynamoQuestion) =>
    set(() => ({
      currentQuestion: question,
    })),

  currentWebhook: undefined,
  setCurrentWebhook: (webhook: DynamoWebhook) =>
    set(() => ({
      currentWebhook: webhook,
    })),

  showUpdateWebhookModal: false,
  openUpdateWebhookModal: () =>
    set(() => ({
      showUpdateWebhookModal: true,
    })),
  closeUpdateWebhookModal: () => {
    console.log('CLOSING update webhook modal');
    set(() => ({
      showUpdateWebhookModal: false,
    }));
  },
}));
export default useStore;
