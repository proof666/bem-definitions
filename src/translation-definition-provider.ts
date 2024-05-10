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

export class TranslationDefinitionProvider
  implements vscode.DefinitionProvider
{
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.DefinitionLink[]> {
    try {
      const re = /[\'\"\`][a-zA-Z-\._]+\..*[\'\"\`]/g;
      const range = document.getWordRangeAtPosition(position, re);

      if (!range) return;

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

      if (!text || !re.test(text)) {
        return;
      }

      const currentBlockName = currentBlockRoot.split("/").pop();

      const translation = findTranslationInFiles(currentBlockRoot, text);
      console.log({
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
      } else {
        vscode.window.showInformationMessage(
          `No definition found for "${text}"`
        );
      }
    } catch (error) {
      console.error(error);
      vscode.window.showInformationMessage(`Error: ${error}`);
    }
  }
}
