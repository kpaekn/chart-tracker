function Sidebar() {
	var thisObj = this;
	var MONTHS = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	var DAY_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var sidebar = $('.sidebar');
	var lists = {};

	sidebar.delegate('.section li a', 'click', function(e) {
		if(thisObj.hasOwnProperty('onItemSelect')) {
			var date = $(e.currentTarget).find('span').html().split('/');
			thisObj.onItemSelect(date[2], date[0], date[1]);
		}
	});
	sidebar.delegate('h2 a', 'click', function(e) {
		var link = $(e.currentTarget);
		link.html((link.html() == 'hide') ? 'show' : 'hide');
		link.parent().next().slideToggle(200);
	});

	// private functions
	function sortList(list, attr) {
		var obj = {}, keys = [], len;
		$(list).find('li').each(function(i, el) {
			var k = Number($(el).attr('data-day'));
			obj[k] = $(el);
			keys.push(k);
		});

		keys.sort();
		len = keys.length;
		for(var i = len - 1; i >= 0; i--) {
			k = keys[i];
			$(list).append(obj[k]);
		}
	}
	function sortSections() {
		var obj = {}, keys = [], len;
		sidebar.find('>.section').each(function(i, el) {
			var month = $(el).attr('data-month');
			if(month.length == 1)
				month = '0' + month;
			var k = $(el).attr('data-year') + month;
			obj[k] = $(el);
			keys.push(k);
		});

		keys.sort();
		len = keys.length;
		for(var i = len - 1; i >= 0; i--) {
			k = keys[i];
			sidebar.append(obj[k]);
		}
	}
	function getKey(year, month) {
		return year + '-' + month;
	}

	// public functions
	this.addItem = function(year, month, day) {
		var key = getKey(year, month);
		if(!lists[key]) {
			// create new list
			var section = $('<div class="section" data-year="' + year + '" data-month="' + month + '"></div>');
			var h2 = $('<h2>' + MONTHS[month] + ' ' + year + ' <a href="#">hide</a></h2>');
			var ul = $('<ul></ul>');
			sidebar.append(section);
			section.append(h2, ul);
			sortSections();
			lists[key] = ul;
		}

		var ul = lists[key];
		if(ul.find('li[data-day="' + day + '"]').length > 0)
			return console.log('item already exists.');

		var label = month + '/' + day + '/' + year;
		var date = new Date();
		var subLabel = DAY_OF_WEEK[(new Date(year, month - 1, day)).getDay()];
		var item = $('<li data-day="' + day + '"><a href="#"><span>' + label + '</span> <small>' + subLabel + '</small></a></li>');
		ul.append(item);
		sortList(ul);
	};

	this.removeItem = function(year, month, day) {
		var key = getKey(year, month);
		if(lists[key]) {
			lists[key].find('li[data-day="' + day + '"]').remove();
		}
	};
	return this;
}