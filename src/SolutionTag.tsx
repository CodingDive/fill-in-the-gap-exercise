import React, { PropsWithChildren } from "react";
import { css } from "styled-components";

export const SolutionTag = ({
  children,
  onClick,
  isSolutionUsed,
}: PropsWithChildren<{ onClick: () => void; isSolutionUsed?: boolean }>) => {
  return (
    <button
      onClick={onClick}
      css={`
        display: flex;
        flex-direction: row;
        align-items: self-end;
        margin-right: 1rem;
        letter-spacing: -0.012em;
        line-height: 1.5;
        tab-size: 4;
        min-width: 2.5rem;
        background-color: white;
        color: rgb(0 126 193/1);
        overflow-wrap: break-word;
        border-radius: 4rem;
        border-style: none;
        cursor: pointer;
        line-height: normal;
        padding: 0.75rem 1rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration-line: none;
        ${isSolutionUsed &&
        css`
          text-decoration: line-through;
        `}

        :hover {
          background-color: #007ec1;
          color: white;
        }

        :focus-visible {
          outline: 2px dashed #007ec1;
        }
      `}
    >
      {children}
    </button>
  );
};
