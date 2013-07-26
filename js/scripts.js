var database = new Database();
var sidebar = new Sidebar();
var content = new Content();

$('.selectpicker').selectpicker({
	showIcon: true
});

sidebar.onOutstandingSelect = function() {
	content.loadOutstanding();
};
sidebar.onItemSelect = function(id, year, month, day) {
	content.loadList(id, year, month, day);
};