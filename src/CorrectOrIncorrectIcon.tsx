import "styled-components";
import CheckMarkIcon from "./assets/check_mark_icon.svg";
import IncorrectIcon from "./assets/incorrect_icon.svg";
import { IGap, STATUS } from "./IFillInTheGapMachine";

const getStatus = (gaps: IGap[], gapId: string): STATUS =>
  gaps.find(({ id }) => id === gapId)?.status || STATUS.UNCHECKED;

export const CorrectOrIncorrectIcon = ({
  gaps,
  gapId,
}: {
  gaps: IGap[];
  gapId: string;
}) => {
  const status = getStatus(gaps, gapId);

  if (status === STATUS.UNCHECKED) {
    return null;
  }

  return status === STATUS.CORRECT ? (
    <img
      src={CheckMarkIcon}
      alt="Correct!"
      width="20px"
      height="20px"
      css={`
        margin-left: 15px;
        margin-top: auto;
      `}
    />
  ) : (
    <img
      src={IncorrectIcon}
      alt="Wrong!"
      width="20px"
      height="20px"
      css={`
        margin-left: 15px;
        margin-top: auto;
      `}
    />
  );
};
