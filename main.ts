import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';

export default class HyperlinkRemover extends Plugin {
	async onload() {

		this.addCommand({
			id: 'remove-hyperlinks-from-selection',
			name: 'Remove hyperlinks from selection',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (selection) {
					editor.replaceSelection(removeHyperlinks(selection));
					new Notice('Hyperlinks removed from selection');
				} else {
					new Notice('No text selected to remove hyperlinks from');
				}
			}
		});
		this.addCommand({
			id: 'remove-hyperlinks-from-file',
			name: 'Remove hyperlinks from file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const content = editor.getValue();
				const updatedContent = removeHyperlinks(content);
				if (content !== updatedContent) {
					editor.setValue(updatedContent);
					new Notice('Hyperlinks removed from file');
				} else {
					new Notice('No hyperlinks found in the file');
				}
			}
		});

		// Context menu / Remove hyperlinks / Selection
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("Remove hyperlinks from selection")
						.setIcon("unlink")
						.setDisabled(!editor.somethingSelected())
						.onClick(() => {
							const selection = editor.getSelection();
							const updatedSelection = removeHyperlinks(selection);
							if (selection !== updatedSelection) {
								editor.replaceSelection(updatedSelection);
								new Notice('Hyperlinks removed from selection');
							} else {
								new Notice('No hyperlinks found in the selection');
							}
						});
				});
			})
		);

		// Context menu / Remove hyperlinks / File
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("Remove hyperlinks from file")
						.setIcon("unlink")
						.onClick(() => {
							const content = editor.getValue();
							const updatedContent = removeHyperlinks(content);
							if (content !== updatedContent) {
								editor.setValue(updatedContent);
								new Notice('Hyperlinks removed from file');
							} else {
								new Notice('No hyperlinks found in the file');
							}
						});
				});
			})
		);

	}

	onunload() {

	}
}

function removeHyperlinks(text:string): string {
	let result = text;
	let match;
	const regex = /\[((?:[^\]\\]|\\.|\](?!\())*?)\]\(/g;

	while ((match = regex.exec(text)) !== null) {
		const linkText = match[1];
		const startPos = match.index;
		const urlStartPos = match.index + match[0].length;

		// Find the matching closing parenthesis
		let parenCount = 1;
		let urlEndPos = urlStartPos;

		while (urlEndPos < text.length && parenCount > 0) {
			if (text[urlEndPos] === '(') {
				parenCount++;
			} else if (text[urlEndPos] === ')') {
				parenCount--;
			}
			if (parenCount > 0) {
				urlEndPos++;
			}
		}

		if (parenCount === 0) {
			const fullMatch = text.substring(startPos, urlEndPos + 1);
			result = result.replace(fullMatch, linkText);
		}
	}

	return result;
}