import * as vscode from "vscode";

import { CnDefinitionProvider } from "./cn-definition-provider";
import { TranslationDefinitionProvider } from "./translation-definition-provider";
import { FormTranslationDefinitionProvider } from "./form-translation-definition-provider";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new CnDefinitionProvider()
  );

  context.subscriptions.push(disposable);

  let disposable2 = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new TranslationDefinitionProvider()
  );

  context.subscriptions.push(disposable2);

  let disposable3 = vscode.languages.registerDefinitionProvider(
    { language: "typescriptreact" },
    new FormTranslationDefinitionProvider()
  );

  context.subscriptions.push(disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() {}
