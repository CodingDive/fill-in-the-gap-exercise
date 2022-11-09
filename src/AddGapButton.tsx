import { useSlate } from "slate-react";
import "styled-components";
import { buttonStyle } from "./styles";

export const AddGapButton = () => {
  const editor = useSlate();
  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
        editor.insertGap();
      }}
      css={`
        ${buttonStyle}
      `}
    >
      Add gap
    </button>
  );
};
