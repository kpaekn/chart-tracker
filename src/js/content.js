var Content = function(selector) {
	var content = $(selector);
	content.header = content.find('h1');
	content.form = content.find('form');
	content.list = content.find('ul');

	var editPatientModal = $('#edit-patient-modal');
	editPatientModal.first = editPatientModal.find('.first');
	editPatientModal.last = editPatientModal.find('.last');
	editPatientModal.birthday = editPatientModal.find('.birthday');
	editPatientModal.saveBtn = editPatientModal.find('.save');

	var editLocationModal = $('#edit-location-modal');
	editLocationModal.name = editLocationModal.find('.name');
	editLocationModal.saveBtn = editLocationModal.find('.save');

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
						content.loadLists();
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
			var form = content.form;
			form.first = form.find('.first');
			form.last = form.find('.last').focus();
			form.birthday = form.find('.birthday');
			form.location = form.find('.location');
			form.printBtn = content.form.find('.print');
			form.printBtn.click(function(e) {
				e.preventDefault();
				document.title = 'List for ' + date.format('m-d-yyyy');
				window.print();
			});

			$('.typeahead').remove();
			form.last.typeahead({
				source: function(typeahead, query) {
					Database.getPatients(function(patients) {
						var i, p;
						for(i = 0; i < patients.length; i++) {
							p = patients[i];
							patients[i] = {
								value: p.last + ', ' + p.first + ((p.birthday) ? ' (' + p.birthday + ')' : ''),
								first: p.first,
								last: p.last,
								birthday: p.birthday
							};
						}
						typeahead.process(patients);
					});
				}, onselect: function(obj) {
					form.first.val(obj.first);
					form.last.val(obj.last);
					form.birthday.val(obj.birthday);
					form.location.focus();
				}
			});
			form.location.typeahead({
				source: function(typeahead, query) {
					Database.getLocations(function(locations) {
						var i;
						for(i = 0; i < locations.length; i++) {
							locations[i] = locations[i].name;
						}
						typeahead.process(locations);
					});
				}
			})

			form.submit(function(e) {
				e.preventDefault();
				if(checkRequiredInputs([form.last, form.first, form.location])) {
					Database.checkOutChart(id, form.first.val(), form.last.val(), form.birthday.val(), form.location.val(), function(resp) {
						if(resp.success) {
							content.loadList(id, date);
						} else {
							$.alert.show('Failed to check out chart: ' + resp.message);
						}
					});
				}
			});
		});
		Database.getCheckedOutCharts(id, function(charts) {
			var date = new Date();
			setList(charts, createChartListItem);
		});
	};

	content.loadOutstanding = function() {
		setHeader('Outstanding Charts', 'icon-exclamation-sign');
		setForm('forms/outstanding.html', function() {
			content.form.printBtn = content.form.find('.print');
			content.form.printBtn.click(function(e) {
				document.title = 'Outstanding Charts';
				window.print();
			});
			content.form.submit(function(e) {
				e.preventDefault();
			});
		});
		Database.getOutstandingCharts(function(charts) {
			setList(charts, createChartListItem);
		});
	};

	content.loadPatients = function() {
		setHeader('Patients', 'icon-user');
		setForm();

		Database.getPatients(function(patients) {
			setList(patients, function(patient) {
				var li = $('<li></li>');
				var deleteBtn = createInlineBtn('icon-remove', 'delete', 'Delete');
				var name = $('<a class="name" href="#">' + patient.last + ', ' + patient.first + ' <small>' + patient.birthday + '</small></a>');
				li.append(deleteBtn, name);
				deleteBtn.click(function(e) {
					Database.deletePatient(patient.id);
					li.slideUp(200, function() {
						li.remove();
					});
				}).tooltip();
				name.click(function(e) {
					e.preventDefault();
					var m = editPatientModal;
					m.modal('show');
					m.first.val(patient.first);
					m.last.val(patient.last);
					m.birthday.val(patient.birthday);
					m.saveBtn.button('reset');
					m.saveBtn.click(function() {
						if(checkRequiredInputs([m.first, m.last])) {
							m.saveBtn.off('click').button('loading');
							Database.updatePatient(patient.id, m.first.val(), m.last.val(), m.birthday.val(), function(resp) {
								name.html(m.last.val() + ', ' + m.first.val() + ' <small>' + m.birthday.val() + '</small>')
								m.modal('hide');
							});	
						}
					});
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
				var deleteBtn = createInlineBtn('icon-remove', 'delete', 'Delete');
				var name = $('<a class="name" href="#">' + location.name + '</a>');
				li.append(deleteBtn, name);
				deleteBtn.click(function(e) {
					Database.deleteLocation(location.id);
					li.slideUp(200, function() {
						li.remove();
					});
				}).tooltip();
				name.click(function(e) {
					e.preventDefault();
					var m = editLocationModal;
					m.modal('show');
					m.name.val(location.name);
					m.saveBtn.button('reset');
					m.saveBtn.click(function() {
						if(checkRequiredInputs([m.name])) {
							m.saveBtn.off('click').button('loading');
							Database.updateLocation(location.id, m.name.val(), function(resp) {
								name.html(m.name.val());
								m.modal('hide');
							});	
						}
					});
				});
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

	var intervalId = 0;
	function setList(items, toDom){
		clearInterval(intervalId);
		content.list.empty();
		if(items) {
			var len = items.length, i, NUM = 10;
			var target = Math.min(NUM, len);
			for(i = 0; i < target; i++) {
				content.list.append(toDom(items[i]));
			}
			if(len > target) {
				intervalId = setInterval(function() {
					target = Math.min(target + NUM, len);
					while(i < target) {
						content.list.append(toDom(items[i]));
						i++;
					}
					if(target == len) clearInterval(timerId);
				}, 250);
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

	function createChartListItem(chart) {
		var li = $('<li></li>');
		var deleteBtn = createInlineBtn('icon-remove', 'delete', 'Delete');
		var returnBtn = createInlineBtn('icon-ok', 'return', 'Return');
		var unReturnBtn = createInlineBtn('icon-undo', 'un-return', 'Un-Return');
		var name = $('<span class="name">' + chart.last + ', ' + chart.first + ' <small>' + chart.birthday + '</small></span>');
		var location = $('<span class="location">' + chart.location + '</span>');
		var checkOutTime = $('<span class="time text-right">' + dateFormat(chart.checkOutTime, 'm/d/yy-h:mmtt') + '</span>');
		var timeArrow = $('<span class="time-arrow">&raquo;</span>');
		var returnTime = (chart.returnTime == -1) ? 'Not Returned' : dateFormat(chart.returnTime, 'm/d/yy-h:mmtt');
			returnTime = $('<span class="time">' + returnTime + '</span>');
		li.append(deleteBtn, returnBtn, unReturnBtn, name, location, checkOutTime, timeArrow, returnTime);

		if(chart.returnTime !== -1) {
			li.addClass('returned');
		}

		li.find('.inline-btn').tooltip();
		deleteBtn.click(function() {
			Database.deleteCheckedOutChart(chart.id, function(resp) {
				if(resp.success) {
					li.slideUp(200, function(){
						li.remove();
					});
				}
			});
		});
		returnBtn.click(function() {
			Database.returnChart(chart.id, function(resp) {
				if(resp.success) {
					li.addClass('returned');
					returnTime.html(dateFormat(resp.returnTime, 'm/d/yy-h:mmtt'));
				}
			});
		});
		unReturnBtn.click(function() {
			Database.unReturnChart(chart.id, function(resp) {
				if(resp.success) {
					li.removeClass('returned');
					returnTime.html('n/a');
				}
			});
		});

		return li;
	}

	function createInlineBtn(icon, _class, tooltip) {
		return $('<span class="inline-btn ' + _class + '" title="' + tooltip + '"><i class="' + icon + '"></i></span>').tooltip();
	}

	return content;
};