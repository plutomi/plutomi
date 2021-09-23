import create from "zustand";

const useStore = create((set) => ({
  createOrgModalIsOpen: false,
  createFunnelModalIsOpen: false,
  createStageModalIsOpen: false,

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
  setCreateFunnelModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createFunnelModalIsOpen: open,
    })),
  setCreateStageModalOpen: (open: Boolean) =>
    set((state: PlutomiState) => ({
      createStageModalIsOpen: open,
    })),
}));
export default useStore;
