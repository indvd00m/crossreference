/*
 * Created by indvd00m - 14.11.2016.
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */
CKEDITOR.dialog.add('crossreferenceDialog', function(editor) {
	
	var defaultConfig = {
		role: 'User',
		showNumber: true
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
		dialog.setValueOf('tab-source', 'manualGuid', manualGuid);
	}

	var filterManuals = function(e) {
		var filterText = dialog.getValueOf('tab-source', 'filterText');
		if (filterText)
			filterText = filterText.trim().toLowerCase();
		else
			filterText = '';
		
		var manualGuidSelect = dialog.getContentElement('tab-source', 'manualGuid');
		var selectedGuid = null;
		$('option', manualGuidSelect.$).each(function() {
			var option = $(this);
			var text = option.text();
			if (filterText.length == 0 || text.toLowerCase().indexOf(filterText) != -1) {
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
		minWidth : 450,
		minHeight : 180,
		
		onLoad : function() {
			var manualGuidSelect = this.getContentElement('tab-source', 'manualGuid');
			manualGuidSelect.getInputElement().setStyle('width', '100%');
			
			jQuery.getJSON('api/manual-service', {
				filter: JSON.stringify({
					role: config.role
				}),
				loadText: false
			}, function(data) {
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
			})
		},
		
		onShow : function() {
			dialog = this;

			selectedElement = editor.getSelection();
			if (selectedElement)
				selectedElement = selectedElement.getSelectedElement();
			if (!selectedElement || selectedElement.getName() !== 'a')
				selectedElement = null;

			dialog.setValueOf('tab-source', 'filterText', '');
			filterManuals();
			
			updateSelected();
		},
		
		onOk : function() {

			var manualGuid = dialog.getValueOf('tab-source', 'manualGuid');
			var manual = findManual(manualGuid);
			
			var element = null;
			if (selectedElement)
				element = selectedElement;
			else
				element = editor.document.createElement('a');
			element.setAttribute('manual-reference', '');

			element.setAttribute('manual-guid', manual.guid);
			element.setAttribute('manual-name', manual.name);
			element.setAttribute('manual-number', manual.number || '');
			element.setAttribute('href', '#manual-' + manual.guid);
			
			var text = 'Руководство: ';
			if (config.showNumber && manual.number)
				text += manual.number + ' ';
			text += manual.name;
			element.setText(text);

			if (!selectedElement)
				editor.insertElement(element);

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
								id : 'filterText',
								width: '100%',
								label : editor.lang.crossreference.filterText,
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
