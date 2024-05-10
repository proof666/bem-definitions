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

export class CnDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.DefinitionLink[]> {
    const range = document.getWordRangeAtPosition(
      position,
      /cn[a-zA-z]+\(\'[a-zA-z-]+\'.*\)/g
    );

    if (!range) return;

    const editor = vscode.window.activeTextEditor;
    const text = editor?.document.getText(range);
    const currentEntityPath = ensureDirectoryPath(document.uri.fsPath);

    const {
      config: { naming },
    } = getConfigs(currentEntityPath);

    const bemNaming = createBemNaming(naming);

    const { currentBlockRoot, ...bem } = getBemStringByPath(currentEntityPath, [
      bemNaming.elemDelim,
      bemNaming.modDelim,
      bemNaming.modValDelim,
    ]);

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
      classList = eval(code);
    } catch (error) {
      console.error("Error:", error);
    }

    const classLocations = findClassesInFiles(
      currentBlockRoot,
      classList.split(" ")
    );

    console.debug({
      bem,
      text,
      currentBlockRoot,
      code,
      currentBlockName,
      classList,
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
    } else {
      vscode.window.showInformationMessage(`No definition found for "${text}"`);
    }
  }
}
