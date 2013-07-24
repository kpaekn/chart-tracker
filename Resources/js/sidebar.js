function Sidebar() {
	var MONTHS = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var DAY_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var sidebar = $('.sidebar');
	var lists = {};

	// private functions
	function sortList(list, attr) {
		var obj = {}, keys = [], len;
		$(list).each(function(i, el) {
			console.log(el);
			obj[$(el).attr('data-day')] = $(el);
		});

		for(k in obj) {
			if(obj.hasOwnProperty(k)) {
				keys.push(k);
			}
		}
		keys.sort();
		len = keys.length;
		for(i = 0; i < len; i++) {
			k = keys[i];
			$(list).append(obj[k]);
		}
	}

	// public functions
	this.addItem = function(year, month, day) {
		var key = year + '-' + month;
		if(!lists[key]) {
			// create new list
			var h2 = $('<h2>' + MONTHS[month] + ' <a href="#">hide</a></h2>');
			var ul = $('<ul class="section"></ul>');
			sidebar.append(h2, ul);
			lists[key] = ul;
		}

		var ul = lists[key];
		if(ul.find('li[data-day="' + day + '"]').length > 0)
			return console.log('item already exists.');


		var label = month + '/' + day + '/' + year;
		var subLabel = DAY_OF_WEEK[(new Date()).getDay()];
		var item = $('<li data-day="' + day + '"><a href="#">' + label + ' <small>' + subLabel + '</small></a></li>');
		ul.append(item);
		sortList(ul);
	};
	return this;

	this.adddddList = function(title) {
		var header = $('<h2>' + title + ' <a href="#">hide</a></h2>');
		var list = $('<ul class="section"></ul>');
		sidebar.append(header, list);
		lists[title] = list;
	};
	this.addIddddtem = function(listName, label, subLabel) {
		var item = $('<li><a href="#">' + label + ' <small>' + subLabel + '</small></a></li>');
		lists[listName].append(item);
	};
}