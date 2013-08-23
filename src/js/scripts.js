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
					callback(e);
				}
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

// settings
var settingsLink = $('a.settings');
settingsLink.find('a').click(function(e) {
	e.preventDefault();
});

var settingsMenu = $('ul.settings');
settingsMenu.export = settingsMenu.find('.export');
settingsMenu.import = settingsMenu.find('.import');

settingsMenu.export.click(function(e) {
	e.preventDefault();
	var data = {};
	var proccessData = function() {
		// run only when all data has been retrived
		if(data.lists && data.patients && data.locations && data.charts) {
			saveFile('ctracker-' + dateFormat(new Date(), 'yyyy-mm-dd_HH.MM.ss') + '.dat', JSON.stringify(data));
		}
	};
	Database.getLists(function(lists) {
		data.lists = lists;
		proccessData();
	});
	Database.getPatients(function(patients) {
		data.patients = patients;
		proccessData();
	});
	Database.getLocations(function(locations) {
		data.locations = locations;
		proccessData();
	});
	Database.getCheckedOutCharts(function(charts) {
		data.charts = charts;
		proccessData();
	});
});
settingsMenu.import.click(function(e) {
	e.preventDefault();
	var fileInput = $('<input type="file" id="files" name="files[]" multiple />');
	fileInput.on('change', function(e) {
		fileInput.off('change');
		var files = e.target.files, i, file;
		for(i = 0; i < files.length; i++) {
			file = files[i];
			var reader = new FileReader();
			reader.addEventListener('loadend', function(e) {
				try {
					var data = JSON.parse(e.target.result);
					Database.importData(data, function(resp) {
						console.log(resp);
					});
				} catch(err) {
					$.alert.show('Failed to import data. The file was either corrupted or is in the wrong format.');
				}
			});
			reader.readAsText(file);
		}
	});
	// simulate file browse
	fileInput.click();
});

function saveFile(filename, data) {
	var downloadLink = document.createElement("a");
	downloadLink.href = window.webkitURL.createObjectURL(new Blob([data], {type: 'text/plain'}));
	downloadLink.download = filename;
	downloadLink.click(); 
}