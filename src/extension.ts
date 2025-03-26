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
