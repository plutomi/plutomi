import { create } from "zustand";

export enum UseCase {
  Hiring = "Employee Hiring",
  Contracting = "Large Scale Contracting",
  Services = "Social Services"
}

type UseCaseState = {
  useCase: UseCase;
  setUseCase: (useCase: UseCase) => void;
};

export const useUseCaseStore = create<UseCaseState>()((set) => ({
  useCase: UseCase.Hiring,
  setUseCase: (useCase: UseCase) => {
    set({ useCase });
  }
}));
