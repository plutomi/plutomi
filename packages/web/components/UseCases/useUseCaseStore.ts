import { create } from "zustand";

export type UseCase =
  | "Employee Hiring"
  | "Large Scale Contracting"
  | "Social Services";

type UseCaseState = {
  useCase: UseCase;
  setUseCase: (useCase: UseCase) => void;
};

export const useUseCaseStore = create<UseCaseState>()((set) => ({
  useCase: "Employee Hiring",
  setUseCase: (useCase: UseCase) => {
    set({ useCase });
  }
}));
