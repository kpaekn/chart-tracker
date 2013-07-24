var database = new Database();
var sidebar = new Sidebar();

var lists = database.getLists();
for(var i = 0; i < lists.length; i++) {
	sidebar.addItem(lists[i].year, lists[i].month, lists[i].day)
}

sidebar.onItemSelect = function(year, month, day) {
	console.log(year, month, day);
};