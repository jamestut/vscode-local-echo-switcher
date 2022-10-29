import * as vscode from 'vscode';

let infoStatusBarItem: vscode.StatusBarItem;
let infoStatusBarHideTimeout: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
	infoStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	infoStatusBarItem.hide();
	context.subscriptions.push(vscode.commands.registerCommand(
		'local-echo-switcher-command.toggleLocalEcho', toggleLocalEcho));
}

async function toggleLocalEcho() {
	const targetState = !await getLocalEchoState();
	await setLocalEchoState(targetState);
	const targetStateStr = targetState ? "enabled" : "disabled";
	infoStatusBarItem.text = `$(terminal-view-icon) local echo ${targetStateStr}`;
	resetStatusBarHideTimeout();
	infoStatusBarItem.show();
}

function resetStatusBarHideTimeout() {
	if (infoStatusBarHideTimeout) {
		clearTimeout(infoStatusBarHideTimeout);
		infoStatusBarHideTimeout = null;
	}
	infoStatusBarHideTimeout = setTimeout(() => {
		infoStatusBarItem.hide();
		infoStatusBarHideTimeout = null;
	}, 1250);
}

function getLocalEchoState(): boolean {
	const cfg = vscode.workspace.getConfiguration('terminal.integrated');
	let ret = cfg.localEchoEnabled === 'on';
	ret &&= cfg.localEchoLatencyThreshold <= 0;
	return ret;
}

async function setLocalEchoState(enable: boolean) {
	const cfg = vscode.workspace.getConfiguration('terminal.integrated');
	await cfg.update("localEchoEnabled", (enable ? "on" : "off"), vscode.ConfigurationTarget.Global);
	await cfg.update("localEchoLatencyThreshold", 0, vscode.ConfigurationTarget.Global);
}

// this method is called when your extension is deactivated
export function deactivate() {}
