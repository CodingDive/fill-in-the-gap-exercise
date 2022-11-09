import { Descendant, Path } from "slate";

export enum STATUS {
  "UNCHECKED" = "unchecked",
  "CORRECT" = "correct",
  "INCORRECT" = "incorrect",
}

export type IGap = {
  id: string;
  solution: string;
  answerOfUser?: string | undefined;
  path?: Path;
  children: Descendant[];
  status: STATUS;
};

export type IFillInTheGapEvent =
  | {
      type: "TOGGLE_EDIT";
    }
  | {
      type: "SOLVE_GAP";
      solution: string;
      id: string;
    }
  | {
      type: "SOLVE_NEXT_GAP";
      solution: string;
    }
  | {
      type: "CHECK_SOLUTIONS";
    }
  | {
      type: "STILL_SOLVING_EXERCISE";
    }
  | {
      type: "CURRENT_EDITOR_GAPS";
      gaps: IGap[];
    }
  | {
      type: "DEBOUNCE_PERSIST_INPUT";
      value: Descendant[];
    }
  | {
      type: "PERSIST_INPUT";
      value: Descendant[];
    };

export interface IFillInTheGapContext {
  initialText: Descendant[];

  gaps: IGap[];

  shuffledSolutions: { solution: string; gapId: string }[];

  newSolution: string;
}
