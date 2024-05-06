export interface MessageBoxProps {
  level: "info" | "success" | "warning" | "error";
  title: string;
  children: React.ReactNode;
}

const MAP_LEVEL_TO_COLOR = {
  info: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-500" },
  success: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-500",
  },
  warning: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-500",
  },
  error: { bg: "bg-red-100", text: "text-red-700", border: "border-red-500" },
};

export const MessageBox: React.FunctionComponent<MessageBoxProps> = ({
  level,
  title,
  children,
}) => {
  return (
    <div
      className={`border-l-4 p-4 ${MAP_LEVEL_TO_COLOR[level].bg} ${MAP_LEVEL_TO_COLOR[level].border} ${MAP_LEVEL_TO_COLOR[level].text}`}
      role="alert"
    >
      {title && <h3 className="font-bold pb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};
