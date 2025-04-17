import * as vscode from "vscode";

import { CnDefinitionProvider } from "./cn-definition-provider";
import { TranslationDefinitionProvider } from "./translation-definition-provider";
import { FormTranslationDefinitionProvider } from "./form-translation-definition-provider";
const exec = require("child_process").exec;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "bem-definitions.polyglot",
      (uri: vscode.Uri) => {
        const dirPath = vscode.Uri.joinPath(uri, "..").fsPath;

        const command = `npx polyglot code-sync ${uri.path} -y`;

        exec(
          command,
          { cwd: dirPath },
          (error: any, stdout: string, stderr: string) => {
            if (error) {
              vscode.window.showErrorMessage(`Error: ${error.message}`);
              return;
            }
            if (stderr) {
              vscode.window.showErrorMessage(`Error: ${stderr}`);
              return;
            }
            vscode.window.showInformationMessage(
              `Command executed successfully: ${stdout}`
            );
          }
        );
      }
    )
  );

  let disposable = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new CnDefinitionProvider()
  );
  context.subscriptions.push(disposable);

  let disposablets = vscode.languages.registerDefinitionProvider(
    { language: "typescript" },
    new CnDefinitionProvider()
  );
  context.subscriptions.push(disposablets);

  let disposable2 = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new TranslationDefinitionProvider()
  );

  context.subscriptions.push(disposable2);

  let disposable2ts = vscode.languages.registerDefinitionProvider(
    { language: "typescript" },
    new TranslationDefinitionProvider()
  );

  context.subscriptions.push(disposable2ts);

  let disposable3 = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new FormTranslationDefinitionProvider()
  );

  context.subscriptions.push(disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() {}
