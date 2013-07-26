function Records() {
	var records = $('.records');

	this.addChart = function(id) {
		console.log('add record')
	};

	return this;
}
function Content() {
	var selectedList,
		content = $('.content'),
		records = new Records();

	var header = content.find('h2');
		header.deleteBtn = header.find('.delete-list');
	var deleteListModal = $('#delete-list-modal');
		deleteListModal.deleteBtn = deleteListModal.find('.delete');

	var checkOutForm = content.find('#check-out-form');
		checkOutForm.lastName = checkOutForm.find('.last-name');
		checkOutForm.firstName = checkOutForm.find('.first-name');
		checkOutForm.birthday = checkOutForm.find('.birthday');
		checkOutForm.location = checkOutForm.find('.location');

	header.deleteBtn.click(function(e) {
		if(selectedList) {
			deleteListModal.modal('show');
		}
	});
	deleteListModal.deleteBtn.click(function(e) {
		if(selectedList) {
			database.deleteList(selectedList.id, function() {
				deleteListModal.modal('hide');
				sidebar.removeItem(selectedList.year, selectedList.month, selectedList.day);
				content.fadeOut();
			});
		}
	});

	// auto complete for selecting chart
	checkOutForm.lastName.typeahead({
		source: function(query, process) {
			database.getCharts(function(charts) {
				for(var i = 0; i < charts.length; i++) {
					charts[i] = charts[i].last + ', ' + charts[i].first + ((charts[i].birthday) ? (' (' + charts[i].birthday + ')') : '');
				}
				process(charts);
			});
		},
		matcher: function(item) {
			var lastName = item.split(',')[0].toLowerCase();
			var query = this.query.toLowerCase();
			return (lastName.indexOf(query) !== -1);
		},
		updater: function(item) {
			var split = item.split(', ');
			var lastName = split[0];
			split = split[1].split(' ');
			var firstName = split[0];
			var birthday = (split.length == 2) ? split[1] : '';
			birthday = birthday.replace(/[\(\)]/g, '');
			checkOutForm.firstName.val(firstName);
			checkOutForm.birthday.val(birthday);
			return lastName;
		}
	});
	// checkout form
	checkOutForm.submit(function(e) {
		e.preventDefault();
		if(selectedList) {
			var last = checkOutForm.lastName.val(),
				first = checkOutForm.firstName.val(),
				birthday = checkOutForm.birthday.val(),
				location = checkOutForm.location.val();
			if(!last || !first || !location) {
				alert('Last name, first name, and location are required.');
			} else {
				database.checkOutChart(selectedList.id, last, first, birthday, location, function(data) {
					if(!data.success) {
						alert(data.message);
					} else {
						records.addChart(data.id)
					}
				});	
			}
		}
	});

	// private functions
	var setHeader = function(text) {
		header.find('span').html(text);
	};

	// public functions
	this.loadList = function(id, year, month, day) {
		selectedList = {
			id: id,
			year: year,
			month: month,
			day: day
		};
		content.fadeOut(400, function() {
			content.removeClass('outstanding').addClass('normal');
			setHeader(MONTHS[month] + ' ' + day + ', ' + year);
			database.getChartsCheckedOut(id, function(charts) {
				console.log(charts);
				content.fadeIn();
			});
		});
	};
	this.loadOutstanding = function() {
		selectedList = null;
		content.fadeOut(400, function() {
			content.removeClass('normal').addClass('outstanding');
			setHeader('Outstanding Charts');
			content.fadeIn();
		});
	};

	return this;
}