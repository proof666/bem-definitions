import * as vscode from "vscode";

// @ts-ignore
import getBemStringByPath from "bemg/lib/generate/getBemStringByPath";
// @ts-ignore
import ensureDirectoryPath from "bemg/lib/generate/ensureDirectoryPath";
// @ts-ignore
import getConfigs from "bemg/lib/getConfigs";
// @ts-ignore
import createBemNaming from "bem-naming";
import { findTranslationInFiles } from "./utils/find-translation-in-files";
import { getLogger } from "./utils/logger";

const logger = getLogger("form-translation-definition-provider");

export class FormTranslationDefinitionProvider
  implements vscode.DefinitionProvider
{
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.DefinitionLink[]> {
    try {
      const re =
        /<FormMessage\s+(?:prefix="([^"]*)"\s+name="([^"]*)"|name="([^"]*)"\s+prefix="([^"]*)")\s*\/?>|formMessage\(\{\s*(?:prefix:\s*'([^']*)'\s*,\s*name:\s*'([^']*)'|name:\s*'([^']*)'\s*,\s*prefix:\s*'([^']*)')\s*\}\)/g;
      const range = document.getWordRangeAtPosition(position, re);

      if (!range) {
        logger.info("No range. Exit.");

        return;
      }

      const editor = vscode.window.activeTextEditor;
      const text = editor?.document.getText(range).replace(/'/g, '"');
      const currentEntityPath = ensureDirectoryPath(document.uri.fsPath);

      if (!text) {
        logger.info("No text parsed by provided range. Exit.");

        return;
      }

      const match = re.exec(
        text.includes("FormMessage") ? text : text.replace(/"/g, "'")
      );

      if (!match) {
        logger.info("No text parsed by provided range. Exit.");

        return;
      }

      const prefix = match[1] || match[4] || match[5];
      const name = match[2] || match[3] || match[6];

      const {
        config: { naming },
      } = getConfigs(currentEntityPath);

      const bemNaming = createBemNaming(naming);

      const { currentBlockRoot, ...bem } = getBemStringByPath(
        currentEntityPath,
        [bemNaming.elemDelim, bemNaming.modDelim, bemNaming.modValDelim]
      );

      const currentBlockName = currentBlockRoot.split("/").pop();

      const suffix = [prefix, name].filter(Boolean).join(":");
      const translationText =
        '"' + [currentBlockName, suffix].filter(Boolean).join(".") + '"';

      const translation = findTranslationInFiles(
        currentBlockRoot,
        translationText
      );

      logger.info("Debug info:", {
        bem,
        text,
        currentBlockRoot,
        currentBlockName,
        translation,
      });

      if (translation) {
        return translation.map((definitionLocation) => {
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
