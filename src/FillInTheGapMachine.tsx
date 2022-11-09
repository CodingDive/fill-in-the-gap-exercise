import { assign, createMachine, send } from "xstate";
import { cancel, choose } from "xstate/lib/actions";
import {
  IFillInTheGapContext,
  IFillInTheGapEvent,
  STATUS,
} from "./IFillInTheGapMachine";

const defaultFillInTheGapMachineContext: IFillInTheGapContext = {
  initialText: [
    {
      type: "paragraph",
      children: [
        {
          text: "Serlo wurde im ",
        },
        {
          type: "fill-in-the-gap",
          solution: "Oktober 2009",
          answerOfUser: undefined,
          id: "129310923909",
          children: [{ text: "Oktober 2009" }],
          status: STATUS.UNCHECKED,
        },
        {
          text: " gegründet mit dem Ziel ",
        },
        {
          type: "fill-in-the-gap",
          solution: "Chancengleichheit",
          answerOfUser: undefined,
          id: "2341310123891",
          children: [{ text: "Chancengleichheit" }],
          status: STATUS.UNCHECKED,
        },
        {
          text: " zu ermöglichen und qualitativ hochwertige Bildung kostenlos verfügbar zu machen. Die Inhalte werden durch breite Beteiligung durch Lehrende, kostenfrei Schüler*innen zur Verfügung gestellt und sind durch eine freie Lizenz ",
        },
        {
          type: "fill-in-the-gap",
          solution: "Open Educational Resources",
          answerOfUser: undefined,
          id: "7178238912398",
          children: [{ text: "Open Educational Resources" }],
          status: STATUS.UNCHECKED,
        },
        {
          text: ".",
        },
      ],
    },
  ],
  gaps: [],
  shuffledSolutions: [],
  newSolution: "",
};

export const fillInTheGapMachine = createMachine(
  {
    id: "fillInTheGap",
    context: defaultFillInTheGapMachineContext,
    predictableActionArguments: true,
    schema: {
      context: {} as IFillInTheGapContext,
      events: {} as IFillInTheGapEvent,
    },
    tsTypes: {} as import("./FillInTheGapMachine.typegen").Typegen0,
    initial: "editing",
    entry: "retrieveInitialTextFromLocalStorage",
    states: {
      editing: {
        on: {
          PERSIST_INPUT: {
            actions: "persistInputInLocalStorage",
          },
          DEBOUNCE_PERSIST_INPUT: {
            actions: [
              "cancelPersistInputEvent",
              "sendPersistInputEventAfterTimeout",
            ],
          },
          TOGGLE_EDIT: {
            target: "solving",
            actions: ["shuffleSolutions"],
          },
          CURRENT_EDITOR_GAPS: {
            actions: "assignGaps",
          },
        },
      },
      solving: {
        initial: "ongoing",
        states: {
          ongoing: {},
          verifying: {
            on: {
              STILL_SOLVING_EXERCISE: {
                target: "ongoing",
              },
            },
          },
        },
        on: {
          PERSIST_INPUT: {
            actions: "persistInputInLocalStorage",
          },
          TOGGLE_EDIT: { target: "editing", actions: "clearSolutionsFromGaps" },
          SOLVE_NEXT_GAP: [
            {
              actions: ["findNextGapAndSendSolveGapEvent"],
              cond: "hasGaps",
            },
            {
              actions: () => void console.warn("No gaps found!"),
            },
          ],
          SOLVE_GAP: {
            actions: [
              "assignAnswerOfUserToGap",
              "fillGapWithSolution",
              "sendCheckSolutionsEventOnceAllGapsAreFilled",
            ],
          },
          CHECK_SOLUTIONS: {
            target: ".verifying",
            actions: [
              // ! It's important to note that the editor has not been updated
              // yet as it was not needed for the minimal example. Only the gaps
              // within the XState code know about the status of the gaps. One
              // could call the 'assignStatusToAllGaps' action in react land (as
              // a callback to machine.withConfig when invoking the machine) to
              // make slate aware of the status of the gaps.
              "assignStatusToAllGaps",
              (context, event) =>
                void console.log("Check solutions called!", { context, event }),
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      findNextGapAndSendSolveGapEvent: send((context, event) => ({
        type: "SOLVE_GAP",
        solution: event.solution,
        /**
         * Once all gaps are filled, the last gap is filled with the solution of
         * the event
         */
        id:
          context.gaps.find((gap) => !Boolean(gap.answerOfUser))?.id ||
          context.gaps[context.gaps.length - 1].id,
      })),
      assignGaps: assign({
        gaps: (context, event) => event.gaps,
      }),
      /**
       * Assigns the answer of the user to the specified id
       */
      assignAnswerOfUserToGap: assign({
        gaps: (context, event) =>
          context.gaps.map((gap) =>
            gap.id === event.id ? { ...gap, answerOfUser: event.solution } : gap
          ),
      }),
      shuffleSolutions: assign({
        shuffledSolutions: (context) =>
          context.gaps
            .map(({ solution, id: gapId }) => ({
              solution,
              gapId,
              sortRandomizer: Math.random(),
            }))
            .sort((a, b) => a.sortRandomizer - b.sortRandomizer)
            .map(({ solution, gapId }) => ({ solution, gapId })),
      }),
      sendCheckSolutionsEventOnceAllGapsAreFilled: choose([
        {
          cond: "areAllGapsFilled",
          actions: "sendCheckSolutionsEvent",
        },
        {
          actions: send({ type: "STILL_SOLVING_EXERCISE" }),
        },
      ]),
      sendCheckSolutionsEvent: send({ type: "CHECK_SOLUTIONS" }),
      assignStatusToAllGaps: assign({
        gaps: (context, event) =>
          context.gaps.map((gap) =>
            !Boolean(gap?.answerOfUser)
              ? { ...gap, status: STATUS.INCORRECT }
              : gap.answerOfUser === gap.solution
              ? { ...gap, status: STATUS.CORRECT }
              : { ...gap, status: STATUS.INCORRECT }
          ),
      }),
      cancelPersistInputEvent: cancel("persistInput"),
      retrieveInitialTextFromLocalStorage: assign({
        initialText: (context) =>
          Boolean(localStorage.getItem("fill-in-the-gap"))
            ? JSON.parse(localStorage.getItem("fill-in-the-gap") as string)
            : context.initialText,
      }),
      /**
       * Persists the current document into localstorage after 2.5 seconds.
       */
      sendPersistInputEventAfterTimeout: send(
        (context, event) => ({ type: "PERSIST_INPUT", value: event.value }),
        { delay: 2500, id: "persistInput" }
      ),
      persistInputInLocalStorage: (context, event) => {
        localStorage.setItem("fill-in-the-gap", JSON.stringify(event.value));
      },
    },
    guards: {
      hasGaps: (context) => context.gaps.length > 0,
      areAllGapsFilled: (context) =>
        !context.gaps.some(({ answerOfUser }) => !Boolean(answerOfUser)),
    },
  }
);
