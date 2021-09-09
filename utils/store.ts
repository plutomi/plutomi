import create from "zustand";

const useStore = create((set) => ({
  createOrgModalIsOpen: false,
  pokemons: [
    { id: 1, name: "Bulbasaur" },
    { id: 2, name: "Ivysaur" },
    { id: 3, name: "Venusaur" },
    { id: 4, name: "Charmander" },
    { id: 5, name: "Charmeleon" },
  ],
  addPokemons: (pokemon: Pokemon) =>
    set((state: NewSate) => ({
      pokemons: [
        { name: pokemon.name, id: Math.random() * 100 },
        ...state.pokemons,
      ],
    })),
  removePokemon: (id: number) =>
    set((state: NewSate) => ({
      pokemons: state.pokemons.filter((pokemon) => pokemon.id !== id),
    })),

  setCreateOrgModalOpen: (open: Boolean) =>
    set((state: NewSate) => ({
      createOrgModalIsOpen: open,
    })),
}));
export default useStore;
