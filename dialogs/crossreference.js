/*
 * Created by indvd00m - 14.11.2016.
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */
// TODO fix double click in ie8

CKEDITOR.dialog.add('crossreferenceDialog', function(editor) {
	
	var defaultConfig = {
		showNumber: true,
		manualProvider: function(callback) {
			callback([
				{
					guid: 'testGuid1',
					number: '1.1',
					name: 'Test name'
				},
				{
					guid: 'testGuid2',
					number: '1.2',
					name: 'Test name 2'
				}
			]);
		}
	}
	var config = CKEDITOR.tools.extend(defaultConfig, editor.config.crossreference || {}, true);

	var dialog = null;
	var selectedElement = null;
	var manuals = [];
	
	var findManual = function(guid) {
		for (var i = 0; i < manuals.length; i++) {
			var manual = manuals[i];
			if (manual.guid == guid)
				return manual;
		}
		return null;
	};
	
	var updateSelected = function() {
		var manualGuid = null;
		if (selectedElement) {
			if (typeof (selectedElement.getAttribute('manual-guid')) == 'string') {
				manualGuid = selectedElement.getAttribute('manual-guid');
			}
		}
		if (dialog)
			dialog.setValueOf('tab-source', 'manualGuid', manualGuid);
	}

	var filterManuals = function(e) {
		var filter = dialog.getValueOf('tab-source', 'filter');
		if (filter)
			filter = filter.trim().toLowerCase();
		else
			filter = '';
		
		var manualGuidSelect = dialog.getContentElement('tab-source', 'manualGuid');
		var selectedGuid = null;
		$('option', manualGuidSelect.$).each(function() {
			var option = $(this);
			var text = option.text();
			if (filter.length == 0 || text.toLowerCase().indexOf(filter) != -1) {
				option.removeAttr('disabled', 'disabled');
				if (selectedGuid == null)
					selectedGuid = option.val();
			} else {
				option.attr('disabled', 'disabled');
			}
		});
		manualGuidSelect.setValue(selectedGuid);
	};

	return {
		title : editor.lang.crossreference.description,
		minWidth : 300,
		minHeight : 150,
		
		onLoad : function() {
			var manualGuidSelect = this.getContentElement('tab-source', 'manualGuid');
			manualGuidSelect.getInputElement().setStyle('width', '100%');
			
			config.manualProvider(function(data) {
				manuals = data;
				for (var i = 0; i < manuals.length; i++) {
					var manual = manuals[i];
					
					var key = '';
					for (var j = 0; j < manual.level; j++)
						key += '&nbsp;&nbsp;&nbsp;&nbsp;';
					if (manual.number)
						key += manual.number + ' ';
					key += manual.name;
					
					var value = manual.guid;
					
					manualGuidSelect.add(key, value);
				}

				// fix &nbsp;
				$('option', manualGuidSelect.$).each(function() {
					var option = $(this);
					var text = option.text();
					option.html(text);
				});
				
				updateSelected();
			});
		},
		
		onShow : function() {
			dialog = this;

			selectedElement = editor.getSelection();
			if (selectedElement)
				selectedElement = selectedElement.getSelectedElement();
			if (!selectedElement || selectedElement.getName() !== 'a')
				selectedElement = null;

			dialog.setValueOf('tab-source', 'filter', '');
			filterManuals();
			
			updateSelected();
		},
		
		onOk : function() {

			var manualGuid = dialog.getValueOf('tab-source', 'manualGuid');
			var manual = findManual(manualGuid);
			
			if (manual == null)
				return;
			
			var element = null;
			if (selectedElement) {
				element = selectedElement;
			} else {
				element = editor.document.createElement('a');
				editor.insertElement(element);
			}
			
			element.setAttribute('manual-reference', '');
			element.setAttribute('manual-guid', manual.guid);
			element.setAttribute('manual-name', manual.name);
			element.setAttribute('manual-number', manual.number || '');
			element.setAttribute('href', '#manual-' + manual.guid);
			if (!element.hasClass('manual-reference'))
				element.addClass('manual-reference');
			
			var text = 'Руководство: ';
			if (config.showNumber && manual.number)
				text += manual.number + ' ';
			text += manual.name;
			element.setText(text);
		},

		contents : [ 
			{
				id : 'tab-source',
				label : editor.lang.common.generalTab,
				elements : [ 
					{
						type : 'vbox',
						widths : [ '100%' ],
						children : [
							{
								type : 'text',
								id : 'filter',
								width: '100%',
								label : editor.lang.crossreference.filter,
								onKeyUp : filterManuals
							},
							{
								type : 'select',
								id : 'manualGuid',
								width: '100%',
								label : editor.lang.crossreference.manual,
								items : []
							}
						]
					} 
				]
			} 
		]
	};
});
