var database = new Database();
var sidebar = new Sidebar();
var content = new Content();

$('[title]').qtip({
	position: {
		my: 'left center',
		at: 'right center'
	}
});
$('.selectpicker').selectpicker({
	showIcon: true
});

sidebar.onOutstandingSelect = function() {
	content.loadOutstanding();
};
sidebar.onItemSelect = function(id, year, month, day) {
	content.loadList(id, year, month, day);
};