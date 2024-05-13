import {
  IChildLogger,
  IVSCodeExtLogger,
  getExtensionLogger,
} from "@vscode-logging/logger";
import { ExtensionContext, window } from "vscode";

const EXT_NAME = "bem-definitions";

let loggerImpel: IVSCodeExtLogger;

export function getLogger(label?: string): IChildLogger {
  return label ? loggerImpel.getChildLogger({ label }) : loggerImpel;
}

function setLogger(newLogger: IVSCodeExtLogger): void {
  loggerImpel = newLogger;
}

export const logger = getExtensionLogger({
  extName: EXT_NAME,
  level: "info",
  logOutputChannel: window.createOutputChannel(EXT_NAME),
  sourceLocationTracking: false,
  logConsole: true,
});

setLogger(logger);
