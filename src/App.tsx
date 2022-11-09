import { useState } from "react";
import { FillInTheGap } from "./FillInTheGap";
import SerloLogo from "./assets/serlo.png";

function App() {
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        color: #333;
        padding: 2rem;
      `}
    >
      <div
        css={`
          justify-content: center;
          align-items: center;
          text-align: center;
        `}
      >
        <a href="https://serlo.org" target="_blank">
          <img
            src={SerloLogo}
            css={`
              height: auto;
              max-width: 500px;
            `}
            alt="Serlo logo"
          />
        </a>
      </div>
      <FillInTheGap />
    </div>
  );
}

export default App;
