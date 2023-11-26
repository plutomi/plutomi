"use client";
import { UseCaseCards } from "./UseCaseCards";
import { UseCaseSegment } from "./UseCaseSegment";

export const UseCaseSection: React.FC = () => (
  <div className="mt-12 flex flex-col space-y-4 w-full items-center ">
    <UseCaseSegment />
    <div className="w-2/3 lg:w-full ">
      <UseCaseCards />
    </div>
  </div>
);
