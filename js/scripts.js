var sidebar = new Sidebar();
var content = new Content();

$('.selectpicker').selectpicker({
	showIcon: true
});

sidebar.onOutstandingSelect = function() {
	content.loadOutstanding();
};
sidebar.onItemSelect = function(year, month, day) {
	console.log(year, month, day);
	content.loadList(year, month, day);
};