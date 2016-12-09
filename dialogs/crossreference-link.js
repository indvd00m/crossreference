CKEDITOR.dialog.add('crossreference-link-dialog', function(editor) {
	
	var config = editor.config.crossreference;
	
	var updateAnchors = function(dialog) {
		dialog.setValueOf('tab-main', 'filter', '');
		
		var anchorSelect = dialog.getContentElement('tab-main', 'anchor');
		anchorSelect.clear();
		anchorSelect.add('', '');
		
		var type = null;
		var typeName = dialog.getValueOf('tab-main', 'type');
		if (typeName)
			type = config.types[typeName];
		
		config.findAnchors(editor, type, function(anchors) {
			for (var i = 0; i < anchors.length; i++) {
				var anchor = anchors[i];
				var guid = anchor.guid;
				var label = config.formatText(type.anchorTextTemplate, anchor);
				anchorSelect.add(label, guid);
			}
			
			// fix &nbsp; and others
			$('option', anchorSelect.getInputElement().$).each(function() {
				var option = $(this);
				var text = option.text();
				option.html(text);
			});
			
			if (!dialog.insertMode)
				anchorSelect.setup(dialog.element);
		});
	};
	
	var filterAnchors = function(dialog) {
		var filter = dialog.getValueOf('tab-main', 'filter');
		if (filter)
			filter = filter.trim().toLowerCase();
		else
			filter = '';
		
		var anchorSelect = dialog.getContentElement('tab-main', 'anchor');
		var selected = null;
		$('option', anchorSelect.getInputElement().$).each(function() {
			var option = $(this);
			var text = option.text();
			if (filter.length == 0 || text.toLowerCase().indexOf(filter) != -1) {
				option.removeAttr('disabled', 'disabled');
				if (selected == null)
					selected = option.val();
			} else {
				option.attr('disabled', 'disabled');
			}
		});
		anchorSelect.setValue(selected);
	};
	
	return {
		title : editor.lang.crossreference.link,
		minWidth : 400,
		minHeight : 150,
		
		contents : [ 
			{
				id : 'tab-main',
				label : editor.lang.crossreference.link,
				elements : [ 
					{
						type : 'vbox',
						widths : [ '100%' ],
						children : [
							{
								type : 'html',
								id : 'description',
								html : '<div style="white-space: normal; text-align: justify;">' + editor.lang.crossreference.linkDescription + '</div>',
							},
							{
								type : 'select',
								id : 'type',
								width: '100%',
								label : editor.lang.crossreference.anchorType,
								required: true,
								items : [['']],
								onLoad: function() {
									this.getInputElement().setStyle('width', '100%');
									for (var typeName in config.types) {
										var type = config.types[typeName];
										var label = type.name;
										this.add(label, type.type);
									}
								},
								onChange: function() {
									updateAnchors(this.getDialog());
								},
								setup: function(element) {
									this.setValue(element.getAttribute('cross-reference'));
								},
								commit: function(element) {
									element.setAttribute('cross-reference', this.getValue());
								}
							},
							{
								type : 'text',
								id : 'filter',
								width: '100%',
								label : editor.lang.crossreference.linkFilter,
								onKeyUp : function() {
									filterAnchors(this.getDialog());
								}
							},
							{
								type : 'select',
								id : 'anchor',
								width: '100%',
								label : editor.lang.crossreference.anchor,
								required: true,
								items : [['']],
								onLoad: function() {
									this.getInputElement().setStyle('width', '100%');
								},
								setup: function(element) {
									this.setValue(element.getAttribute('cross-guid'));
								},
								commit: function(element) {
									element.setAttribute('cross-guid', this.getValue());
								}
							}
						]
					} 
				]
			} 
		],
		
		onLoad : function() {

		},
		
		onShow : function() {
			var selection = editor.getSelection();
			this.element = selection.getStartElement();
			if (this.element)
				this.element = this.element.getAscendant('a', true);
			if (!this.element || this.element.getName() != 'a') {
				this.element = editor.document.createElement('a');
				this.element.setAttribute('cross-link', '');
				this.insertMode = true;
			} else {
				this.insertMode = false;
			}
			
			if (!this.insertMode)
				this.setupContent(this.element);
		},
		
		onOk : function() {
			if (!this.getValueOf('tab-main', 'type'))
				return;
			if (!this.getValueOf('tab-main', 'anchor'))
				return;
			
			this.commitContent(this.element);
			
			if (this.insertMode)
				editor.insertElement(this.element);
			
			editor.execCommand('update-crossreferences');
		}
		
	};
});