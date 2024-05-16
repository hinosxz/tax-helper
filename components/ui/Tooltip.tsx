import Tippy, { type TippyProps } from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export interface TooltipProps extends Pick<TippyProps, "maxWidth"> {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip handle */
  children: TippyProps["children"];
}

/** Tooltip component based on Tippy, with default styles */
export const Tooltip: React.FunctionComponent<TooltipProps> = ({
  content,
  children,
  ...tippyProps
}) => {
  return (
    <Tippy content={content} {...tippyProps}>
      {children}
    </Tippy>
  );
};
