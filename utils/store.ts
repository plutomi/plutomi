import create from "zustand";

const useStore = create((set) => ({
  // TODO this is stupidly gross!!!
  createOrgModalIsOpen: false,
  createOpeningModalIsOpen: false,
  createStageModalIsOpen: false,
  openingsSearchInput: "",
  createInviteModalIsOpen: false,

  questionModal: {
    is_open: false || true, // False by default
    modal_mode: "CREATE" || "EDIT", // Will render text differently
    question_id: "",
    question_title: "",
    question_description: "",
  },
  setQuestionModal: (questionModal: QuestionModalInput) => {
    set((state) => ({
      questionModal: questionModal,
    }));
  },

  // Example
  pokemons: [
    { id: 1, name: "Bulbasaur" },
    { id: 2, name: "Ivysaur" },
    { id: 3, name: "Venusaur" },
    { id: 4, name: "Charmander" },
    { id: 5, name: "Charmeleon" },
  ],
  addPokemons: (pokemon: Pokemon) =>
    set((state: PlutomiState) => ({
      pokemons: [
        { name: pokemon.name, id: Math.random() * 100 },
        ...state.pokemons,
      ],
    })),
  removePokemon: (id: number) =>
    set((state: PlutomiState) => ({
      pokemons: state.pokemons.filter((pokemon) => pokemon.id !== id),
    })),

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
