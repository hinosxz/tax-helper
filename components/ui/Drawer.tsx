import { useState } from "react";

export const Drawer: React.FunctionComponent<{
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div
        className="flex items-center gap-2 cursor-pointer justify-between p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>{title}</div>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};
