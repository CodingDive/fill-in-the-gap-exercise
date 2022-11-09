import {
  Text,
  createEditor,
  Node,
  Element,
  Editor,
  Descendant,
  BaseEditor,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import { IGap } from "./IFillInTheGapMachine";

import type {} from "styled-components/cssprop";

type IGapWithoutPath = Omit<IGap, "path">;

export type FillInTheGapElement = {
  type: "fill-in-the-gap";
} & IGapWithoutPath;

export type ParagraphElement = {
  type: "paragraph";
  align?: string;
  children: Descendant[];
};

type CustomElement = FillInTheGapElement | ParagraphElement;

export type EmptyText = {
  text: string;
};

interface IFillInTheGapGapEditor {
  isGap: (element: CustomElement) => boolean;

  insertGap: (solution?: string) => void;
}

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor &
  IFillInTheGapGapEditor;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: EmptyText;
  }
}
