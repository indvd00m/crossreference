CKEDITOR.plugins.add('crossreference', {
	lang : [ 'en', 'ru' ],
	requires : 'dialog',
	icons : 'crossreference',
	hidpi : true,
	init : function(editor) {
		
		// config
		
		var config = getConfig();
		editor.config.crossreference = config;
		
		// plugin
		
		var anchorAllowedContent = 'a[!cross-reference,cross-anchor,cross-guid,cross-name,cross-number]{*}(cross-reference,cross-anchor)';
		var anchorRequiredContent = 'a[cross-reference,cross-anchor]';
		var linkAllowedContent = 'a[!cross-reference,cross-link,cross-guid,cross-name,cross-number]{*}(cross-reference,cross-link)';
		var linkRequiredContent = 'a[cross-reference,cross-link]';
		editor.addFeature({
			name: 'crossreference-anchor',
			allowedContent: anchorAllowedContent,
			requiredContent: anchorRequiredContent
		});
		editor.addFeature({
			name: 'crossreference-link',
			allowedContent: linkAllowedContent,
			requiredContent: linkRequiredContent
		});
		editor.ui.add('crossreference', CKEDITOR.UI_MENUBUTTON, {
			label : editor.lang.crossreference.name,
			modes: {
				wysiwyg: 1 
			},
			toolbar : 'insert',
			onMenu: function() {
				var selectedElement = null;
				
				var selection = editor.getSelection();
				if (selection) {
					var element = null;
					if (selection.getType() == CKEDITOR.SELECTION_ELEMENT)
						element = selection.getSelectedElement();
					else if (selection.getType() == CKEDITOR.SELECTION_TEXT) // ie8 fix
						element = selection.getStartElement();
					if (element && element.hasAttribute('cross-reference')) {
						selectedElement = element;
					}
				}
				
				var state = getMenuState(selectedElement);
				return state;
			}
		});
		
		// dialogs
		
		var updateCrossReferences = 'update-crossreferences';
		var anchorDialog = 'crossreference-anchor-dialog';
		var linkDialog = 'crossreference-link-dialog';
		
		CKEDITOR.dialog.add(anchorDialog, this.path + 'dialogs/crossreference-anchor.js');
		CKEDITOR.dialog.add(linkDialog, this.path + 'dialogs/crossreference-link.js');
		
		editor.addCommand(anchorDialog, new CKEDITOR.dialogCommand(anchorDialog, {
			allowedContent: anchorAllowedContent,
			requiredContent: anchorRequiredContent
		}));
		editor.addCommand(linkDialog, new CKEDITOR.dialogCommand(linkDialog, {
			allowedContent: linkAllowedContent,
			requiredContent: linkRequiredContent
		}));

		// commands
		
		editor.addCommand(updateCrossReferences, {
			exec: function(editor) {
				
				var html = editor.document.getDocumentElement().$;
				
				for (var typeName in config.types) {
					var type = config.types[typeName];
					config.findAnchors(editor, type, function(anchors) {
						for (var i = 0; i < anchors.length; i++) {
							var anchor = anchors[i];
							
							var aName = anchor.type + '-' + anchor.guid;
							var anchorText = config.formatText(type.anchorTextTemplate, anchor);
							
							var anchorElement = $('a[cross-reference="' + type.type + '"][cross-anchor][cross-guid="' + anchor.guid + '"]', html);
							if (anchorElement.length > 0) {
								anchorElement.attr('cross-reference', anchor.type);
								anchorElement.attr('cross-anchor', '');
								anchorElement.attr('cross-guid', anchor.guid);
								anchorElement.attr('cross-name', anchor.name);
								anchorElement.attr('cross-number', anchor.number);
								anchorElement.attr('name', aName);
								if (!anchorElement.hasClass('cross-reference'))
									anchorElement.addClass('cross-reference');
								if (!anchorElement.hasClass('cross-anchor'))
									anchorElement.addClass('cross-anchor');
								
								anchorElement.removeAttr('cross-link');
								anchorElement.removeClass('cross-link');
								
								anchorElement.text(anchorText);
							}
							
							$('a[cross-reference="' + type.type + '"][cross-link][cross-guid="' + anchor.guid + '"]', html).each(function() {
								var linkElement = $(this);
								
								linkElement.attr('cross-reference', anchor.type);
								linkElement.attr('cross-link', '');
								linkElement.attr('cross-guid', anchor.guid);
								linkElement.attr('cross-name', anchor.name);
								linkElement.attr('cross-number', anchor.number);
								linkElement.attr('href', '#' + aName);
								
								if (!linkElement.hasClass('cross-reference'))
									linkElement.addClass('cross-reference');
								if (!linkElement.hasClass('cross-link'))
									linkElement.addClass('cross-link');
								
								linkElement.removeAttr('cross-anchor');
								linkElement.removeClass('cross-anchor');
								
								var linkText = config.formatText(type.linkTextTemplate, anchor);
								linkElement.text(linkText);
								linkElement.attr('title', anchorText);
							});
						}
					});
				}
			}
		});
		editor.on('doubleclick', function(evt) {
			if (evt.data.element && !evt.data.element.isReadOnly() && evt.data.element.getName() === 'a' 
					&& evt.data.element.hasAttribute('cross-reference')) {
				editor.getSelection().selectElement(evt.data.element);
				if (evt.data.element.hasAttribute('cross-anchor')) {
					evt.data.dialog = anchorDialog;
				} else if (evt.data.element.hasAttribute('cross-link')) {
					evt.data.dialog = linkDialog;
				}
			}
		});
		
		// menu
		
		var getMenuState = function(element) {
			var updateCrossReferencesState = CKEDITOR.TRISTATE_OFF;
			var setCrossReferenceAnchorState = CKEDITOR.TRISTATE_OFF;
			var setCrossReferenceLinkState = CKEDITOR.TRISTATE_OFF;
			if (element && element.hasAttribute('cross-anchor')) {
				setCrossReferenceAnchorState = CKEDITOR.TRISTATE_ON;
				setCrossReferenceLinkState = CKEDITOR.TRISTATE_DISABLED;
			}
			if (element && element.hasAttribute('cross-link')) {
				setCrossReferenceLinkState = CKEDITOR.TRISTATE_ON;
				setCrossReferenceAnchorState = CKEDITOR.TRISTATE_DISABLED;
			}
			var items = {
				updateCrossReferences: updateCrossReferencesState,
				setCrossReferenceAnchor: setCrossReferenceAnchorState,
				setCrossReferenceLink: setCrossReferenceLinkState,
			};
			return items;
		}
		if (editor.addMenuItem) {
			editor.addMenuGroup('crossreferenceGroup');
			editor.addMenuItem('updateCrossReferences', {
				label : editor.lang.crossreference.updateCrossReferences,
				command : updateCrossReferences,
				icon: this.path + 'icons/update.png',
				group : 'crossreferenceGroup'
			});
			editor.addMenuItem('setCrossReferenceAnchor', {
				label : editor.lang.crossreference.setCrossReferenceAnchor,
				command : anchorDialog,
				icon: this.path + 'icons/anchor.png',
				group : 'crossreferenceGroup'
			});
			editor.addMenuItem('setCrossReferenceLink', {
				label : editor.lang.crossreference.setCrossReferenceLink,
				command : linkDialog,
				icon: this.path + 'icons/link.png',
				group : 'crossreferenceGroup'
			});
		}
		if (editor.contextMenu) {
			editor.contextMenu.addListener(function(element, selection) {
				if (element.getName() === 'a' && element.hasAttribute('cross-reference')) {
					selection.selectElement(element);
					var state = getMenuState(element);
					return state;
				}
				return null;
			});
		}
		
		function getConfig() {
			var defaultConfig = {
				overrideTypes: false,
				types: {}
			};
			defaultConfig.types.chapter = {
				name: editor.lang.crossreference.chapter,
				anchorTextTemplate: '${number}. ${name}.',
				linkTextTemplate: '${number}',
				numeration: {
					enabled: true,
					firstNumber: '1',
					increase: function(number) {
						var n = parseInt(number);
						return ++n;
					}
				},
				anchorsProvider: 'default'
			};
			defaultConfig.types.image = {
				name: editor.lang.crossreference.figure,
				anchorTextTemplate: editor.lang.crossreference.fig + ' ${number}. ${name}.',
				linkTextTemplate: '${number}',
				numeration: {
					enabled: true,
					firstNumber: '1',
					increase: function(number) {
						var n = parseInt(number);
						return ++n;
					}
				},
				anchorsProvider: 'default'
			};
			defaultConfig.types.table = {
				name: editor.lang.crossreference.table,
				anchorTextTemplate: editor.lang.crossreference.table + ' ${number}. ${name}.',
				linkTextTemplate: '${number}',
				numeration: {
					enabled: true,
					firstNumber: '1',
					increase: function(number) {
						var n = parseInt(number);
						return ++n;
					}
				},
				anchorsProvider: 'default'
			};
			defaultConfig.types.reference = {
				name: editor.lang.crossreference.reference,
				anchorTextTemplate: '[${number}] ${name}.',
				linkTextTemplate: '[${number}]',
				numeration: {
					enabled: true,
					firstNumber: '1',
					increase: function(number) {
						var n = parseInt(number);
						return ++n;
					}
				},
				anchorsProvider: 'default'
			};
			
			var config = CKEDITOR.tools.clone(defaultConfig);
			if (editor.config.crossreference) {
				config = CKEDITOR.tools.extend(config, editor.config.crossreference, true);
				if (!config.overrideTypes) {
					for (var typeName in defaultConfig.types) {
						var type = defaultConfig.types[typeName];
						if (!(typeName in config.types))
							config.types[typeName] = type;
					}
				}
			}
			for (var typeName in config.types) {
				var type = config.types[typeName];
				type.type = typeName;
			}
			
			// shared methods
			config.findAnchors = function(editor, type, callback) {
				var anchors = [];
				
				if (type == null) {
					callback(anchors);
					return;
				}
				
				if (type.anchorsProvider !== 'default') {
					type.anchorsProvider(callback, editor);
					return;
				}
				
				var number = null;
				if (type.numeration.enabled)
					number = type.numeration.firstNumber + '';
				var html = editor.document.getDocumentElement().$;
				$('a[cross-reference="' + type.type + '"][cross-anchor]', html).each(function() {
					var element = $(this);
					var anchor = {
						type: element.attr('cross-reference'),
						guid: element.attr('cross-guid'),
						name: element.attr('cross-name'),
						number: number,
						text: element.text()
					}
					anchors.push(anchor);
					if (type.numeration.enabled)
						number = type.numeration.increase(number);
				});
				
				callback(anchors);
			};
			
			config.formatText = function(template, anchor) {
				var text = template;
				
				for (var propName in anchor) {
					var propValue = anchor[propName];
					var regexp = new RegExp('\\$\\{' + propName + '\\}', 'g');
					if (propValue)
						text = text.replace(regexp, propValue);
					else
						text = text.replace(regexp, '');
				}
				
				if (anchor.level != null) {
					var shift = '';
					for (var i = 0; i < anchor.level; i++)
						shift += '&nbsp;&nbsp;';
					
					text = text.replace(/\$\{levelShift\}/g, shift);
				}
				
				text = text.trim();
				
				return text;
			}
			
			return config;
		}
	}
});
