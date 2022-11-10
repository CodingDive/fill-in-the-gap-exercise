import React, { Fragment, useEffect, useMemo, useState } from "react";
import { isKeyHotkey } from "is-hotkey";
import { Editable, useSlate, withReact } from "slate-react";
import * as SlateReact from "slate-react";
import { v4 as uuid } from "uuid";
import { useMachine } from "@xstate/react";
import {
  Transforms,
  Range,
  createEditor,
  Descendant,
  BaseEditor,
  Editor,
  Element as SlateElement,
  Text as SlateText,
  Node,
} from "slate";
import { withHistory } from "slate-history";
import { css } from "styled-components";
import EditIcon from "./assets/pen_icon.svg";
import { AddGapButton } from "./AddGapButton";
import { Text, Element } from "./SlateElements";
import {
  CustomEditor,
  CustomElement,
  EmptyText,
  FillInTheGapElement,
  IFillInTheGapGapEditor,
} from "./custom-types";
import { buttonStyle } from "./styles";
import { fillInTheGapMachine } from "./FillInTheGapMachine";
import { IGap, STATUS } from "./IFillInTheGapMachine";
import { SolutionTag } from "./SolutionTag";
import { CorrectOrIncorrectIcon } from "./CorrectOrIncorrectIcon";

const withGaps = <T extends CustomEditor>(
  editor: T
): T & IFillInTheGapGapEditor => {
  const {
    deleteFragment,
    deleteBackward,
    insertText,
    insertData,
    isGap,
    isInline,
  } = editor;

  editor.insertData = (data) => {
    insertData(data);
  };
  editor.insertText = (text) => {
    insertText(text);

    const [fillInTheGap] = Editor.nodes(editor, {
      match: (node) => {
        return SlateElement.isElement(node) && node.type === "fill-in-the-gap";
      },
    });
    if (!fillInTheGap) {
      return;
    }

    const fullSolution = Editor.string(editor, fillInTheGap[1]);
    Transforms.setNodes(
      editor,
      { solution: fullSolution },
      { at: fillInTheGap[1] }
    );
  };
  editor.deleteBackward = (unit) => {
    deleteBackward(unit);
    const [fillInTheGap] = Editor.nodes(editor, {
      match: (node) => {
        return SlateElement.isElement(node) && node.type === "fill-in-the-gap";
      },
    });

    if (!fillInTheGap) {
      return;
    }
    const text = Editor.string(editor, fillInTheGap[1]);
    Transforms.setNodes(editor, { solution: text }, { at: fillInTheGap[1] });

    if (!Boolean(text)) {
      Transforms.delete(editor, { at: fillInTheGap[1] });
    }
  };

  editor.isInline = (element: CustomElement) =>
    element.type === "fill-in-the-gap" || isInline(element);

  editor.isGap = (element: CustomElement) =>
    element.type === "fill-in-the-gap" || isGap(element);

  editor.insertGap = (solution: string = "") => {
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const selectedText = selection ? Editor.string(editor, selection) : "";

    const passedSolutionOrSelection = Boolean(solution)
      ? solution
      : selectedText;

    const gapText = Boolean(selectedText) ? passedSolutionOrSelection : "";

    const gap: FillInTheGapElement = {
      type: "fill-in-the-gap",
      solution: passedSolutionOrSelection,
      id: uuid(),
      children: [{ text: gapText }],
      status: STATUS.UNCHECKED,
    };

    if (!Boolean(selectedText)) {
      Transforms.insertNodes(editor, gap);
      Transforms.move(editor, {
        distance: 1,
        unit: "character",
      });
    } else {
      // * Transform.setNodes did not seem to work here and neither did
      //   Transform.wrapNodes. Instead, we're deleting the node then
      //   reinserting it.

      // Delete current selection
      Transforms.delete(editor);
      // Insert gap with the solution being the highlighted text
      Transforms.insertNodes(editor, gap);
    }
  };

  return editor;
};

const getAllGapsFromEditor = (editor: CustomEditor): IGap[] => {
  const solutions =
    Editor.nodes<FillInTheGapElement>(editor, {
      at: [],
      match: (node) =>
        SlateElement.isElement(node) && node.type === "fill-in-the-gap",
    }) || [];

  const gaps: IGap[] = [];

  for (const [node, path] of solutions) {
    gaps.push({ ...node, path });
  }

  return gaps;
};

export const FillInTheGap = () => {
  const editor = useMemo(
    () => withGaps(withReact(withHistory(createEditor()))),
    []
  );

  const [state, send] = useMachine(() =>
    fillInTheGapMachine.withConfig({
      actions: {
        /**
         * Clears all solutions from the gaps
         */
        clearSolutionsFromGaps: (context, event) => {
          for (const { path, answerOfUser } of context.gaps) {
            if (Boolean(answerOfUser)) {
              Transforms.setNodes(
                editor,
                { answerOfUser: undefined, children: [{ text: "" }] },
                { at: path }
              );
            }
          }
        },
        fillGapWithSolution: (context, event) => {
          const path = context.gaps.find(({ id }) => id === event.id)?.path;

          Transforms.setNodes(
            editor,
            {
              answerOfUser: event.solution,
              children: [{ text: event.solution }],
            },
            { at: path }
          );
        },
      },
    })
  );

  useEffect(() => {
    const gaps = getAllGapsFromEditor(editor);
    send({
      type: "CURRENT_EDITOR_GAPS",
      gaps,
    });
  }, []);

  const isEditing = state.matches("editing");

  const allSolutions = state.context.gaps.map((gap) => gap.solution);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { selection } = editor;

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (selection && Range.isCollapsed(selection)) {
      const { nativeEvent } = event;
      if (isKeyHotkey("left", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset", reverse: true });
        return;
      }
      if (isKeyHotkey("right", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset" });
        return;
      }
    }
  };

  return (
    <div
      css={`
        max-width: 100ch;
        display: flex;
        flex-direction: column;
        align-self: center;
      `}
    >
      <h1>Fill-in-the-gap {isEditing ? "editing" : "exercise"}</h1>
      <SlateReact.Slate
        editor={editor}
        value={state.context.initialText}
        onChange={(value) => {
          send({
            type: "DEBOUNCE_PERSIST_INPUT",
            value: editor.children,
          });

          const gaps = getAllGapsFromEditor(editor);

          send({
            type: "CURRENT_EDITOR_GAPS",
            gaps,
          });
        }}
      >
        <div
          css={`
            display: flex;
            flex-direction: row;
            justify-content: ${isEditing ? "space-between" : "flex-end"};
            margin-bottom: 2rem;
          `}
        >
          {isEditing && <AddGapButton />}
          <button
            onClick={() => void send({ type: "TOGGLE_EDIT" })}
            css={`
              ${buttonStyle}
              border-radius: 5px;
              vertical-align: middle;
              display: flex;
              align-items: center;
            `}
          >
            {isEditing ? (
              "SOLVE"
            ) : (
              <Fragment>
                <img
                  src={EditIcon}
                  alt="Edit icon"
                  width="20px"
                  height="20px"
                />
                <span
                  css={`
                    margin-left: 15px;
                  `}
                >
                  EDIT
                </span>
              </Fragment>
            )}
          </button>
        </div>
        <div
          css={`
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
          `}
        >
          {isEditing
            ? state.context.gaps.map((gap) => (
                <SolutionTag
                  key={gap.id}
                  onClick={() =>
                    void send({
                      type: "SOLVE_NEXT_GAP",
                      solution: gap.solution,
                    })
                  }
                >
                  {gap.solution}
                </SolutionTag>
              ))
            : state.context.shuffledSolutions.map(({ solution, gapId }) => (
                <SolutionTag
                  key={gapId}
                  isSolutionUsed={state.context.gaps.some(
                    ({ answerOfUser }) => answerOfUser === solution
                  )}
                  onClick={() =>
                    void send({
                      type: "SOLVE_NEXT_GAP",
                      solution: solution,
                    })
                  }
                >
                  {solution}
                  {state.matches({ solving: "verifying" }) && (
                    <CorrectOrIncorrectIcon
                      gaps={state.context.gaps}
                      gapId={gapId}
                    />
                  )}
                </SolutionTag>
              ))}
        </div>
        <Editable
          readOnly={!isEditing}
          renderElement={(props) => (
            <Element
              {...props}
              isEditing={isEditing}
              solutions={allSolutions}
              changeSolution={(gapId: string, solution: string) =>
                void send({
                  type: "SOLVE_GAP",
                  id: gapId,
                  solution,
                })
              }
            />
          )}
          renderLeaf={(props) => <Text {...props} />}
          placeholder="Enter some text..."
          onKeyDown={onKeyDown}
        />
      </SlateReact.Slate>
    </div>
  );
};
