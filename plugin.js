/*
 * CrossReference Plugin for CKEditor (http://github.com/indvd00m/crossreference)
 * Created by indvd00m - 14.11.2016.
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */
CKEDITOR.plugins.add('crossreference', {
	lang : [ 'en', 'ru' ],
	requires : 'dialog',
	icons : 'crossreference',
	hidpi : true,
	init : function(editor) {
		var pluginName = 'crossreferenceDialog';

		editor.ui.addButton('crossreference', {
			label : editor.lang.crossreference.name,
			command : pluginName,
			toolbar : 'insert'
		});
		CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/crossreference.js');

		editor.addCommand(pluginName, new CKEDITOR.dialogCommand(pluginName, {
			allowedContent : 'a[!manual-reference,manual-guid,manual-name,manual-number]{*}(manual-reference)',
			requiredContent : 'a[manual-reference]'
		}));
		editor.on('doubleclick', function(evt) {
			if (evt.data.element && !evt.data.element.isReadOnly() && evt.data.element.getName() === 'a'
					&& evt.data.element.hasAttribute('manual-reference')) {
				evt.data.dialog = pluginName;
				editor.getSelection().selectElement(evt.data.element);
			}
		});
		if (editor.addMenuItem) {
			editor.addMenuGroup('crossreferenceGroup');
			editor.addMenuItem('crossreferenceItem', {
				label : editor.lang.crossreference.name,
				icon : this.path + 'icons/crossreference.png',
				command : pluginName,
				group : 'crossreferenceGroup'
			});
		}
		if (editor.contextMenu) {
			editor.contextMenu.addListener(function(element, selection) {
				if (element && element.getName() === 'a' && element.hasAttribute('manual-reference')) {
					editor.getSelection().selectElement(element);
					return {
						crossreferenceItem : CKEDITOR.TRISTATE_ON
					};
				}
				return null;
			});
		}
	}
});
