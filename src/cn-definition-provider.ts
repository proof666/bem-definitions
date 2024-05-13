import * as vscode from "vscode";
import { withNaming } from "@bem-react/classname";
import { findClassesInFiles } from "./utils/find-classes-in-files";

// @ts-ignore
import getBemStringByPath from "bemg/lib/generate/getBemStringByPath";
// @ts-ignore
import ensureDirectoryPath from "bemg/lib/generate/ensureDirectoryPath";
// @ts-ignore
import getConfigs from "bemg/lib/getConfigs";
// @ts-ignore
import createBemNaming from "bem-naming";
import { getLogger } from "./utils/logger";

const logger = getLogger("cn-definition-provider");

export class CnDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.DefinitionLink[]> {
    try {
      const range = document.getWordRangeAtPosition(
        position,
        /(cn[a-zA-z]+)(\(\'[a-zA-z-]+\'.*\)|\({}.*\)|\(\))/g
      );

      if (!range) {
        logger.info("No range. Exit.");

        return;
      }

      const editor = vscode.window.activeTextEditor;
      const text = editor?.document.getText(range);
      const currentEntityPath = ensureDirectoryPath(document.uri.fsPath);

      const {
        config: { naming },
      } = getConfigs(currentEntityPath);

      const bemNaming = createBemNaming(naming);

      const { currentBlockRoot, ...bem } = getBemStringByPath(
        currentEntityPath,
        [bemNaming.elemDelim, bemNaming.modDelim, bemNaming.modValDelim]
      );

      // used in eval()
      const cn = withNaming({
        e: bemNaming.elemDelim,
        m: bemNaming.modDelim,
        v: bemNaming.modValDelim,
      });

      if (!text || !text.startsWith("cn")) {
        return;
      }

      const currentBlockName = currentBlockRoot.split("/").pop();
      const code = `cn('${currentBlockName}')` + text.replace(/cn.*\(/g, "(");

      let classList;
      try {
        const formattedCode = code.replace(/,\s?\[[a-zA-Z]+\]/g, "");
        logger.info(`Formatted code:`, { formattedCode });

        classList = eval(formattedCode);

        logger.info("Retrieved classlist:", { classList });

        if (!classList) {
          logger.info(
            `ClassList is empty, fallbackk to currentBlockName "${currentBlockName}".`
          );
          classList = currentBlockName;
        }
      } catch (error) {
        logger.error(`Error while executing code:`, error);
        return;
      }

      const classLocations = findClassesInFiles(
        currentBlockRoot,
        classList.split(" ")
      );

      logger.info("Debug info:", {
        bem,
        text,
        currentBlockRoot,
        code,
        currentBlockName,
        classList,
        classLocations,
      });

      if (classLocations) {
        return classLocations.map((definitionLocation) => {
          const targetRange = new vscode.Range(
            new vscode.Position(
              definitionLocation.start.line,
              definitionLocation.start.character
            ),
            new vscode.Position(
              definitionLocation.end.line,
              definitionLocation.end.character
            )
          );
          return {
            targetUri: vscode.Uri.file(definitionLocation.file),
            targetRange: targetRange,
            targetSelectionRange: targetRange,
          };
        });
      }
    } catch (error) {
      logger.error("Fatal error:", { error });
    }
  }
}
