import Tippy, { type TippyProps } from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip handle */
  children: TippyProps["children"];
}

/** Tooltip component based on Tippy, with default styles */
export const Tooltip: React.FunctionComponent<TooltipProps> = (props) => {
  return <Tippy content={props.content}>{props.children}</Tippy>;
};
