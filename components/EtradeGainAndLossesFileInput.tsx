import { FileInput } from "@/components/ui/FileInput";
import { GainAndLossEvent } from "@/lib/etrade/etrade.types";
import { parseEtradeGL } from "@/lib/etrade/parse-etrade-gl";
import { sendErrorToast } from "@/components/ui/Toast";

export interface EtradeGainAndLossesFileInputProps {
  /** Unique identifier for the input. Available for css selector as `#${id}` */
  id?: string;
  /** Label for the input */
  label?: string;
  /** Function called when data are read from the etrade export  */
  setData: (data: GainAndLossEvent[]) => void;
  /** Function called when an error occurs. */
  handleError?: (error: string) => void;
}

export const EtradeGainAndLossesFileInput: React.FunctionComponent<
  EtradeGainAndLossesFileInputProps
> = ({
  id = "import_etrade_g&l",
  label = "Import from ETrade G&L",
  setData,
  handleError = sendErrorToast,
}) => {
  return (
    <FileInput
      accept=".xlsx"
      id={id}
      label={label}
      onUpload={async (file) => {
        if (!file) {
          return handleError("couldn't import file");
        }
        try {
          const data = await parseEtradeGL(file);
          setData(data);
        } catch (e) {
          handleError(`Failed to import,
                please verify you imported the correct file.`);
        }
      }}
    />
  );
};
