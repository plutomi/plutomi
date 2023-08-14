import { create } from "zustand";

type DashboardState = {
  navbarIsOpen: boolean;
  setNavbarOpen: (openOrClosed: boolean) => void;
};

export const useDashboardState = create<DashboardState>()((set) => ({
  navbarIsOpen: false,
  setNavbarOpen: (openOrClosed) => {
    set(() => ({ navbarIsOpen: openOrClosed }));
  }
}));
