import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('quickBrackets.smartRightArrow', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.selection;
        if (!selection.isEmpty) {
            await vscode.commands.executeCommand('cursorRight');
            return;
        }

        const position = selection.active;
        const currentLine = editor.document.lineAt(position.line);
        const lineText = currentLine.text;

        // Main trigger
        if (position.character >= lineText.length || lineText.charAt(position.character) !== ')') {
            await vscode.commands.executeCommand('cursorRight');
            return;
        }

        // {} Block already exists
        const textAfterParen = lineText.substring(position.character + 1).trimStart();
        if (textAfterParen.startsWith('{')) {
            await vscode.commands.executeCommand('cursorRight');
            return;
        }
        
        const textBeforeCursor = lineText.substring(0, position.character);
        
        // Intentional tolerance to some "unwanted" insertions of snippets
        // e.g {} snippet being created inside strings or commentaries
        const blockOpeningRegex = /\b(if|for|while|switch|function\s*\w*|constructor)\s*\([^)]*$/;
        const match = blockOpeningRegex.test(textBeforeCursor.trim());

        if (!match) {
            await vscode.commands.executeCommand('cursorRight');
            return;
        }
        
        // Without this the snippet is inserted inside the ()
        await vscode.commands.executeCommand('cursorRight');
        
        const snippet = new vscode.SnippetString('{$0}');
        // Ensures proper state of textEditor in cases of alt+tab, change of focus etc. 
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.insertSnippet(snippet);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}