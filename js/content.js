function Records() {
	var items = {};

	var records = $('.records');
		records.list = records.find('ul');

	var editNoteModal = $('#edit-note-modal');
		editNoteModal.textarea = editNoteModal.find('textarea');
		editNoteModal.saveBtn = editNoteModal.find('.save');

	records.list.delegate('li .notes .btn', 'click', function(e) {
		var btn = $(e.currentTarget), 
			notes = btn.next(),
			id = btn.attr('data-id');

		editNoteModal.modal('show');
		editNoteModal.textarea.val(notes.html());
		editNoteModal.textarea.focus();
		editNoteModal.saveBtn.off('click');
		editNoteModal.saveBtn.click(function(e) {
			var newNotes = editNoteModal.textarea.val();
			database.updateNotes(id, newNotes, function() {
				notes.html(newNotes);
				editNoteModal.modal('hide');
			});
		});
	});

	// public functions
	this.addItem = function(id, last, first, birthday, location, checkOutTime, returnTime, notesText) {
		var item = $('<li data-id="' + id + '"></li>'),
			key = last + first + birthday;
		item.attr('data-key', key);
		if(returnTime !== -1) {
			item.addClass('returned');
		}

		var btnGroup = $('<div class="btn-group"></div>'),
			deleteBtn = $('<button class="btn btn-mini btn-danger delete" title="Delete this record."><i class="icon-remove icon-white"></i></button>'),
			returnBtn = $('<button class="btn btn-mini btn-primary return" title="Return this chart."><i class="icon-ok"></i></button>'),
			undoBtn = $('<button class="btn btn-mini undo" title="Undo (un-return the chart)."><i class="icon-undo"</i></button>');
		btnGroup.append(deleteBtn, returnBtn, undoBtn);

		var name = $('<div class="name">' + last + ', ' + first + ' <small>' + birthday + '</small>' + '</div>'),
			location = $('<div class="location">' + location + '</div>');

		var cot = $('<div class="check-out-time">' + formatDate(checkOutTime) + '</div>'),
			arrow = $('<div class="arrow"><i class="icon-arrow-right"></i></div>'),
			ret = $('<div class="return-time">' + formatDate(returnTime) + '</div>');

		var notes = $('<div class="notes"></div>')
			notesBtn = $('<button class="btn btn-mini" title="Edit note."><i class="icon-pencil"></i></button>'),
			notesBody = $('<span>' + notesText + '</span>');
		notesBody.qtip({
			content: function(e) {
				return $(e.currentTarget).html();
			},
			position: {
				my: 'right bottom',
				at: 'left center'
			}
		});
		notes.append(notesBtn, notesBody);

		item.append(btnGroup, name, location, cot, arrow, ret, notes);
		item.find('.btn').attr('data-id', id).qtip({
			position: {
				my: 'bottom center',
				at: 'top center'
			}
		});
		deleteBtn.click(function(e) {
			database.deleteRecord(id, function() {
				item.slideToggle(250, item.remove);
			});
		});
		returnBtn.click(function(e) {
			database.returnChart(id, function(data) {
				item.addClass('returned');
				ret.html(formatDate(data.returnTime));
			});
		});
		undoBtn.click(function(e) {
			database.unReturnChart(id, function(data) {
				item.removeClass('returned');
				ret.html(formatDate(-1));
			});
		});

		if(records.list.find('li').length == 0) {
			records.list.append(item);
		} else {
			var added = false;
			records.list.find('li').each(function(i, el) {
				if(!added) {
					var k = $(el).attr('data-key');
					if(key < k) {
						$(el).before(item);
						added = true;
					}	
				}
			});
			if(!added) {
				records.list.append(item);
			}
		}
	};
	this.removeAllItems = function() {
		records.list.empty();
	}

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

	var outstandingForm = content.find('#outstanding-form');
		outstandingForm.printBtn = outstandingForm.find('.print');

	// deleting lists
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

	// auto complet for selecting location
	checkOutForm.location.typeahead({
		source: function(query, process) {
			database.getLocations(function(locations) {
				for(var i = 0; i < locations.length; i++) {
					locations[i] = locations[i].name;
				}
				process(locations);
			});
		}
	});

	// checkout form
	checkOutForm.submit(function(e) {
		e.preventDefault();
		if(selectedList) {
			var last = checkOutForm.lastName.val().toUpperCase(),
				first = checkOutForm.firstName.val().toUpperCase(),
				birthday = checkOutForm.birthday.val().toUpperCase(),
				location = checkOutForm.location.val().toUpperCase();
			if(!last || !first || !location) {
				alert('Last name, first name, and location are required.');
			} else {
				database.checkOutChart(selectedList.id, last, first, birthday, location, function(data) {
					if(!data.success) {
						alert(data.message);
					} else {
						records.addItem(data.id, last, first, birthday, location, data.check_out_time, -1, '');
					}
					checkOutForm.lastName.focus();
					checkOutForm[0].reset();
				});	
			}
		}
	});

	outstandingForm.printBtn.click(function(e) {
		window.open('print.outstanding.html');
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
		content.fadeOut(250, function() {
			content.removeClass('outstanding').addClass('normal');
			setHeader(MONTHS[month] + ' ' + day + ', ' + year);
			checkOutForm[0].reset();
			database.getChartsCheckedOut(id, function(charts) {
				var i, c;
				records.removeAllItems();
				for(i = 0; i < charts.length; i++) {
					c = charts[i];
					records.addItem(c.id, c.last, c.first, c.birthday, c.location, c.check_out_time, c.return_time, c.notes);
				}
				content.fadeIn();
			});
		});
	};
	this.loadOutstanding = function() {
		selectedList = null;
		content.fadeOut(250, function() {
			content.removeClass('normal').addClass('outstanding');
			setHeader('Outstanding Charts');
			database.getOutstandingCharts(function(charts) {
				var i, c;
				records.removeAllItems();
				for(i = 0; i < charts.length; i++) {
					c = charts[i];
					records.addItem(c.id, c.last, c.first, c.birthday, c.location, c.check_out_time, c.return_time, c.notes);
				}
				content.fadeIn();
			});
		});
	};

	return this;
}