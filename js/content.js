var Content = function(selector) {
	var content = $(selector);
	content.header = content.find('h1');
	content.form = content.find('form');
	content.list = content.find('ul');

	content.loadLists = function() {
		setHeader('Lists', 'icon-file-text');
		setForm('forms/lists.html', function() {
			var date = new Date(), i;
			content.form.date = content.form.find('.date');
			content.form.date.selectpicker();
			content.form.submit(function(e) {
				e.preventDefault();
				var val = content.form.date.val();
				Database.addList(val, function(resp) {
					if(resp.success) {
						// add to list
					} else {
						$.alert.show('Failed to create list: ' + resp.message);
					}
				});
			});
		});

		Database.getLists(function(lists) {
			setList(lists, function(list) {
				var li = $('<li></li>');
				var date = new Date(list.date);
				li.attr('data-id', list.id);
				li.html('<a href="#"><span>' + date.format('m/d/yyyy') + '</span> <small>' + date.format('dddd') + '</small><a>');
				li.a = li.find('a');
				li.a.click(function(e) {
					e.preventDefault();
					content.loadList(list.id, date);
				});
				return li;
			});
		});
	};

	content.loadList = function(id, date) {
		content.trigger('listselected');
		setHeader(date.format('m/d/yyyy') + ' - ' + date.format('dddd'), 'icon-calendar');
		setForm('forms/list.html', function() {
			content.form.first = content.form.find('.first');
			content.form.last = content.form.find('.last');
			content.form.birthday = content.form.find('.birthday');
			content.form.location = content.form.find('.location');
			content.form.submit(function(e) {
				e.preventDefault();
				if(checkRequiredInputs([content.form.last, content.form.first, content.form.location])) {
					var first = content.form.first.val().toUpperCase();
					var last = content.form.last.val().toUpperCase();
					var birthday = content.form.birthday.val().toUpperCase();
					var location = content.form.location.val().toUpperCase();
					Database.checkOutChart(id, first, last, birthday, location, function(resp) {
						if(resp.success) {
							content.form.find('input[type="text"]').val('');
							content.form.last.focus();
						} else {
							$('body').popupAlert({
								body: 'Failed to check out chart: ' + resp.message
							});
						}
					});
				}
			});
		});
		Database.getCheckedOutCharts(id, function(charts) {
			console.log(charts);
			var date = new Date();
			setList(charts, function(chart) {
				var li = $('<li></li>');
				var name = $('<span class="name">' + chart.last + ', ' + chart.first + ' <small>' + chart.birthday + '</small></span>');
				var location = $('<span class="location">' + chart.location + '</span>');
				var checkOutTime = $('<span class="time text-right">' + dateFormat(chart.checkOutTime, 'H:MMt') + '</span>');
				var timeArrow = $('<span class="time-arrow"><i class="icon-arrow-right"></i></span>');
				var returnTime = (chart.returnTime == -1) ? 'N/A' : dateFormat(chart.returnTime, 'H:MMt');
					returnTime = $('<span class="time">' + returnTime + '</span>');
				li.append(name, location, checkOutTime, timeArrow, returnTime);
				return li;
			});
		});
	};

	content.loadOutstanding = function() {
		setHeader('Outstanding Charts', 'icon-exclamation-sign');
		setForm('forms/outstanding.html', function() {
			content.form.submit(function(e) {
				e.preventDefault();
				console.log('print');
			});
		});
		setList();
	};

	content.loadPatients = function() {
		setHeader('Patients', 'icon-user');
		setForm();

		Database.getPatients(function(patients) {
			setList(patients, function(patient) {
				var li = $('<li></li>');
				var name = $('<a href="#">' + patient.last + ', ' + patient.first + ' <small>' + patient.birthday + '</small></a>');
				li.append(name);
				name.click(function(e) {
					e.preventDefault();

				});
				return li;
			});
		});
	};

	content.loadLocations = function() {
		setHeader('Locations', 'icon-compass');
		setForm();
		Database.getLocations(function(locations) {
			setList(locations, function(location) {
				var li = $('<li></li>');
				li.append('<div>' + location.name + '</div>');
				return li;
			});
		});
	};

	// private
	function setHeader(text, icon) {
		var html = '';
		if(icon)
			html = '<i class="' + icon + '"></i> ';
		html += text;
		content.header.html(html);
	}

	function setForm(url, callback) {
		content.form.empty();
		content.form.off('submit');
		if(url)
			content.form.load(url, {}, callback);
	}

	function setList(items, toDom){
		content.list.empty();
		if(items) {
			var len = items.length, i, NUM = 50;
			var target = Math.min(NUM, len);
			for(i = 0; i < target; i++) {
				content.list.append(toDom(items[i]));
			}
			if(len > target) {
				var load = $('<div><button class="btn btn-sm btn-default more">Load More</button> <button class="btn btn-xs btn-default all">Load All</button></div>');
				load.more = load.find('.more');
				load.all = load.find('.all');
				content.list.append(load);

				load.more.click(function(e) {
					target = Math.min(target + NUM, len);
					while(i < target) {
						content.list.append(toDom(items[i]));
						i++;
					}
					if(target == len) load.remove();
				});
				load.all.click(function(e) {
					target = len;
					while(i < target) {
						content.list.append(toDom(items[i]));
						i++;
					}
					load.remove();
				});
			}
		}
	};

	function checkRequiredInputs(fields) {
		var i;
		for(i = 0; i < fields.length; i++) {
			var field = fields[i];
			var container = field.parent();
			var label = container.find('label').html();
			if(field.val() == '') {
				container.addClass('has-error');
				field.popover({
					content: label + ' is required.',
					placement: 'bottom',
					trigger: 'focus'
				}).focus();
				return false;
			} else {
				container.removeClass('has-error');
				field.popover('destroy');
			}
		}
		return true;
	}

	return content;
};