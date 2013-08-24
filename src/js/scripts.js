(function($) {
	$.fn.header = function(arg) {
		var links = this.find('a');
		if(arg == 'clear') {
			links.removeClass('active');
		} else {
			var callback = arg;
			links.click(function(e) {
				e.preventDefault();
				if(!$(e.currentTarget).hasClass('active')) {
					links.removeClass('active');
					$(e.currentTarget).addClass('active');
				}
				callback(e);
			});	
		}
	};
}(jQuery));

var header = $('.header');
var content = new Content('.content');

header.header(function(e) {
	var id = $(e.currentTarget).attr('id');
	switch(id) {
		case 'lists':
			content.loadLists();
			break;
		case 'outstanding':
			content.loadOutstanding();
			break;
		case 'patients':
			content.loadPatients();
			break;
		case 'locations':
			content.loadLocations();
			break;
	}
});
content.on('listselected', function() {
	header.header('clear');
});

header.find('a').first().click();

/* Export/Import
 ==========================================*/
var fs = require('fs');

var deleteDatabaseModal = $('#delete-database-modal');
deleteDatabaseModal.confirm = deleteDatabaseModal.find('.confirm');
deleteDatabaseModal.deleteBtn = deleteDatabaseModal.find('.delete');

var settingsLink = $('a.settings');
settingsLink.find('a').click(function(e) {
	e.preventDefault();
});

var settingsMenu = $('ul.settings');
settingsMenu.export = settingsMenu.find('.export');
settingsMenu.import = settingsMenu.find('.import');
settingsMenu.delete = settingsMenu.find('.delete');

settingsMenu.export.click(function(e) {
	e.preventDefault();
	Database.exportData(function(data) {
		var filename = 'ctracker-' + dateFormat(new Date(), 'yyyy-mm-dd_HH.MM.ss') + '.dat';
		saveFile(filename, JSON.stringify(data));
	});
});
settingsMenu.import.click(function(e) {
	e.preventDefault();
	$('<input type="file" />').change(function(e) {
		var path = $(this).val(); // path to load file from
		fs.readFile(path, 'utf8', function(err, data) {
			if(err) {
				$.alert.show('Failed to open file. ' + JSON.stringify(err));
			}
			try {
				data = JSON.parse(data);
				Database.importData(data, function() {
					$.alert.show('Import successful.');
					header.find('a.active').first().click();
				});
			} catch(err) {
				$.alert.show('Failed to import data. The file was either corrupted or is in the wrong format.');
			}
		});
	}).click();
});
settingsMenu.delete.click(function(e) {
	e.preventDefault();
	var m = deleteDatabaseModal;
	m.modal('show');
	m.deleteBtn.val('Delete Database').addClass('disabled').off('click');
	m.confirm.val('').off('keyup');
	m.confirm.keyup(function(e) {
		if(m.confirm.val().toLowerCase() == 'delete') {
			m.deleteBtn.removeClass('disabled');
			m.deleteBtn.click(function() {
				
			})
		} else {
			m.deleteBtn.addClass('disabled').off('click');
		}
	});
});

function saveFile(filename, data) {
	var a = $('<a></a>').attr({
		href: URL.createObjectURL(new Blob([data], {type: 'text/plain'})),
		download: filename
	})[0].click();
}