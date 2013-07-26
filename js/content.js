function Content() {
	var selectedListId = -1,
		content = $('.content');

	var header = content.find('h2');
		header.deleteBtn = header.find('.delete-list');
	var deleteListModal = $('#delete-list-modal');
		deleteListModal.deleteBtn = deleteListModal.find('.delete');

	var checkOutForm = content.find('#check-out-form');
		checkOutForm.lastName = checkOutForm.find('.last-name');
		checkOutForm.firstName = checkOutForm.find('.first-name');
		checkOutForm.birthday = checkOutForm.find('.birthday');

	header.deleteBtn.click(function(e) {
		if(selectedListId !== -1) {
			deleteListModal.modal('show');
		}
	});
	deleteListModal.deleteBtn.click(function(e) {
		console.log(selectedListId)
		if(selectedListId !== -1) {
			database.deleteList(selectedListId, function() {
				deleteListModal.modal('hide');
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
	checkOutForm.submit(function(e) {
		e.preventDefault();
		console.log('check out chart');
	});

	// private functions
	var setHeader = function(text) {
		header.find('span').html(text);
	};

	// public functions
	this.loadList = function(id, year, month, day) {
		selectedListId = id;
		content.hide();
		content.fadeIn();
		content.removeClass('outstanding').addClass('normal');
		setHeader(MONTHS[month] + ' ' + day + ', ' + year);
	};
	this.loadOutstanding = function() {
		selectedListId = -1;
		content.hide();
		content.fadeIn();
		content.removeClass('normal').addClass('outstanding');
		setHeader('Outstanding Charts');
	};

	return this;
}