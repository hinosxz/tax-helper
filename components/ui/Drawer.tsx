import { useState } from "react";

export const Drawer: React.FunctionComponent<{
  title: React.ReactNode;
  children: React.ReactNode;
  isDefaultOpen?: boolean;
  forceOpen?: boolean;
}> = ({ title, children, isDefaultOpen = false, forceOpen = false }) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const showBody = isOpen || forceOpen;
  return (
    <div>
      <div
        className="flex items-center gap-2 cursor-pointer justify-between p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>{title}</div>
        <span>{showBody ? "▲" : "▼"}</span>
      </div>
      {showBody && <div>{children}</div>}
    </div>
  );
};
