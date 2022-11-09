import React, { useMemo } from "react";
import { RenderElementProps } from "slate-react";
import "styled-components";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { FillInTheGapElement } from "./custom-types";
import { generateRandomNumber } from "./rng";

export const Element = (props: any) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case "fill-in-the-gap":
      return <FillInTheGapComponent {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    css={`
      font-size: 0;
    `}
  >
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const FillInTheGapComponent = ({
  attributes,
  children,
  element,
  isEditing,
  solutions,
  changeSolution,
}: RenderElementProps & {
  element: FillInTheGapElement;
  isEditing: boolean;
  solutions: string[];
  changeSolution: (gapId: string, solution: string) => void;
}) => {
  const { id, solution, answerOfUser } = element;

  /**
   * Generates the amount of gap characters based on the length of the solution
   * and randomly adds up to 3 characters.
   */
  const gapOfSolution = useMemo(
    () =>
      Array(solution.length + generateRandomNumber())
        .fill("_")
        .join(""),
    [solution.length]
  );

  return (
    <span {...attributes}>
      <InlineChromiumBugfix />
      {isEditing ? (
        <span>
          <span
            css={`
              color: lightblue;
              width: 10ch;
              display: inline-block;
              border-bottom: 2px solid lightblue;
              // Hides the space
              white-space: pre;
            `}
          >
            {" "}
            {/* An alternative if the space can get selected would be to try
             * out the non-breaking empty character.
             * We just need something of the span to be rendered to make the border work. */}
            {/* ${String.fromCodePoint(160) /* Non-breaking space */}
          </span>
          <span>[</span>
          {children}
          <span>]</span>
        </span>
      ) : (
        <span>
          <Menu>
            <MenuButton
              css={`
                background: none;
                color: inherit;
                border: none;
                padding: 0;
                font: inherit;
                cursor: pointer;
                outline: inherit;
                color: #5d008b;
              `}
            >
              {Boolean(answerOfUser) ? answerOfUser : gapOfSolution}
            </MenuButton>
            <MenuList>
              {solutions.map((solution) => (
                <MenuItem
                  key={solution}
                  onSelect={() => void changeSolution(id, solution)}
                >
                  {solution}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </span>
      )}
      <InlineChromiumBugfix />
    </span>
  );
};

export const Text = (props: any) => {
  const { attributes, children, leaf } = props;
  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      css={`
        padding-left: ${leaf.text === "" ? "0.1em" : "0"};
      `}
      {...attributes}
    >
      {children}
    </span>
  );
};
