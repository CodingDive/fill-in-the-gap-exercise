// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: "clearSolutionsFromGaps" | "fillGapWithSolution";
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    assignAnswerOfUserToGap: "SOLVE_GAP";
    assignGaps: "CURRENT_EDITOR_GAPS";
    assignStatusToAllGaps: "CHECK_SOLUTIONS";
    cancelPersistInputEvent: "DEBOUNCE_PERSIST_INPUT";
    clearSolutionsFromGaps: "TOGGLE_EDIT";
    fillGapWithSolution: "SOLVE_GAP";
    findNextGapAndSendSolveGapEvent: "SOLVE_NEXT_GAP";
    persistInputInLocalStorage: "PERSIST_INPUT";
    retrieveInitialTextFromLocalStorage: "xstate.init";
    sendCheckSolutionsEvent: "SOLVE_GAP";
    sendCheckSolutionsEventOnceAllGapsAreFilled: "SOLVE_GAP";
    sendPersistInputEventAfterTimeout: "DEBOUNCE_PERSIST_INPUT";
    shuffleSolutions: "TOGGLE_EDIT";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    areAllGapsFilled: "SOLVE_GAP";
    hasGaps: "SOLVE_NEXT_GAP";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "editing"
    | "solving"
    | "solving.ongoing"
    | "solving.verifying"
    | { solving?: "ongoing" | "verifying" };
  tags: never;
}
