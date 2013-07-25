var sidebar = new Sidebar();
var content = new Content();

sidebar.onItemSelect = function(year, month, day) {
	console.log(year, month, day);
	// content.loadList(year, month, day);
};