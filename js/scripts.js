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

var header = $('header');
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
})