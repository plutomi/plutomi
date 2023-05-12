import { create } from "zustand";

export type UseCase =
  | "Employee Hiring"
  | "Social Services"
  | "Large Scale Contracting";

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
