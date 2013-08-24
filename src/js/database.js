var Database = (function() {

	function errHandler(tx, err) {
		console.log(err);
	}

	// converts a Transaction result to an Array
	function toArray(results) {
		var len = results.rows.length, i, items = [];
		for(i = 0; i < len; i++) {
			items.push(results.rows.item(i));
		}
		return items;
	}

	var db = openDatabase('ct1', '1.0', 'Chart Tracker', 2 * 1024 * 1024);
	db.transaction(function(tx) {
		/*
		tx.executeSql('drop table if exists lists');
		tx.executeSql('drop table if exists patients');
		tx.executeSql('drop table if exists locations');
		tx.executeSql('drop table if exists checkedOutCharts');
		*/
		tx.executeSql('create table if not exists lists(id integer primary key, date integer)', [], null, errHandler);
		tx.executeSql('create table if not exists patients(id integer primary key, first varchar(50), last varchar(50), birthday varchar(50), deleted integer default 0)', [], null, errHandler);
		tx.executeSql('create table if not exists locations(id integer primary key, name varchar(50), deleted integer default 0)', [], null, errHandler);
		tx.executeSql('create table if not exists checkedOutCharts(id integer primary key, listId integer, patientId integer, locationId integer, checkOutTime integer, returnTime integer default -1)', [], null, errHandler);
	});

	var obj = {};
	obj.exportData = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql(['select Li.date, P.first, P.last, P.birthday, Lo.name as location, C.checkOutTime, C.returnTime',
						   'from lists Li, patients P, locations Lo, checkedOutCharts C',
						   'where C.listId=Li.id and C.patientId=P.id and C.locationId=Lo.id'].join(' '), [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};
	obj.importData = function(data, callback) {
		helper(data, callback);
	};

	function helper(arr, callback) {
		if(arr.length > 0) {
			var data = arr.shift();
			obj.getListId(data.date, function(listId) {
				obj.getPatientId(data.first, data.last, data.birthday, function(patientId) {
					obj.getLocationId(data.location, function(locationId) {
						console.log('list: ' + listId + ', patient: ' + patientId + ', location: ' + locationId);
						db.transaction(function(tx) {
							tx.executeSql('insert into checkedOutCharts(listId, patientId, locationId, checkOutTime, returnTime) values(?,?,?,?,?)',
													[listId, patientId, locationId, data.checkOutTime, data.returnTime], function(tx, results) {
								helper(arr, callback);
							}, errHandler);
						});
					});
				});
			});
		} else {
			if(typeof(callback) == 'function') {
				callback();	
			}
		}
	}

	obj.deleteDatabase = function(callback) {
		var count = 0;
		var complete = function() {
			count++;
			console.log(count);
			if(count == 4) {
				callback();
			}
		};
		db.transaction(function(tx) {
			tx.executeSql('delete from lists', [], complete, errHandler);
			tx.executeSql('delete from patients', [], complete, errHandler);
			tx.executeSql('delete from locations', [], complete, errHandler);
			tx.executeSql('delete from checkedOutCharts', [], complete, errHandler);
		});
	};

	// gets all lists sorted by date (desc)
	obj.getLists = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from lists order by date desc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// get list id by date
	// adds new list if patient DNE
	obj.getListId = function(date, callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from lists where date=?', [date], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					var id = results.rows.item(0).id;
					callback(id);
				} else {
					tx.executeSql('insert into lists(date) values(?)', [date], function(tx, results) {
						callback(results.insertId);
					});
				}
			}, errHandler);
		});
	}

	// adds a list if it has not been created yet
	obj.addList = function(date, callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from lists where date=?', [date], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					callback({
						success: false,
						message: 'Already exists'
					});
				} else {
					tx.executeSql('insert into lists(date) values(?)', [date], function(tx, results) {
						callback({
							success: true,
							insertId: results.insertId
						});
					}, errHandler);
				}
			}, errHandler);
		})
	};

	// gets all patients
	obj.getPatients = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from patients where deleted=0 order by last, first, birthday asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// get patient id by first, last name and birthday
	// adds new patient if patient DNE
	obj.getPatientId = function(first, last, birthday, callback) {
		first = first.toUpperCase();
		last = last.toUpperCase();
		db.transaction(function(tx) {
			tx.executeSql('select * from patients where first=? and last=? and birthday=?', [first, last, birthday], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					var id = results.rows.item(0).id;
					if(results.rows.item(0).deleted == 1) {
						tx.executeSql('update patients set deleted=0 where id=?', [id], null, errHandler);
					}
					callback(id);
				} else {
					tx.executeSql('insert into patients(first, last, birthday) values(?,?,?)', [first, last, birthday], function(tx, results) {
						callback(results.insertId);
					});
				}
			}, errHandler);
		});
	};

	// updates the patients name and birthday
	obj.updatePatient = function(id, first, last, birthday, callback) {
		first = first.toUpperCase();
		last = last.toUpperCase();
		db.transaction(function(tx) {
			tx.executeSql('update patients set first=?, last=?, birthday=? where id=?', [first, last, birthday, id], function(tx, results) {
				callback({
					success: true
				});
			}, errHandler);
		});
	};

	// marks the patient as deleted
	obj.deletePatient = function(id) {
		db.transaction(function(tx) {
			tx.executeSql('update patients set deleted=1 where id=?', [id], null, errHandler);
		});
	};

	// gets all location; alpha-order
	obj.getLocations = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from locations where deleted=0 order by name asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	}

	// get location id by name
	// add new location if location DNE
	obj.getLocationId = function(name, callback) {
		name = name.toUpperCase();
		db.transaction(function(tx) {
			tx.executeSql('select * from locations where name=?', [name], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					var id = results.rows.item(0).id;
					if(results.rows.item(0).deleted == 1) {
						tx.executeSql('update locations set deleted=0 where id=?', [id], null, errHandler);
					}
					callback(id);
				} else {
					tx.executeSql('insert into locations(name) values(?)', [name], function(tx, results) {
						callback(results.insertId);
					}, errHandler);
				}
			}, errHandler);
		});
	};

	// updates the location name
	obj.updateLocation = function(id, name, callback) {
		name = name.toUpperCase();
		db.transaction(function(tx) {
			tx.executeSql('update locations set name=? where id=?', [name, id], function(tx, results) {
				callback({
					success: true
				});
			}, errHandler);
		});
	};

	// marks the location as deleted
	obj.deleteLocation = function(id) {
		db.transaction(function(tx) {
			tx.executeSql('update locations set deleted=1 where id=?', [id], null, errHandler);
		});
	};

	// gets all checked out charts for the given list
	obj.getCheckedOutCharts = function(listId, callback) {
		db.transaction(function(tx) {
			if(typeof(listId) == 'function') {
				callback = listId;
				tx.executeSql('select * from checkedOutCharts', [], function(tx, results) {
					callback(toArray(results));
				}, errHandler);
			} else {
				tx.executeSql([
					'select C.*, P.first, P.last, P.birthday, L.name as location',
					'from checkedOutCharts C, patients P, locations L',
					'where listId=? and C.patientId=P.id and C.locationId=L.id',
					'order by P.last, P.first, P.birthday asc'].join(' '), [listId], function(tx, results) {
					callback(toArray(results));
				}, errHandler);
			}
		});
	};

	// gets all checked out chart that have not been returned
	obj.getOutstandingCharts = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select C.*, P.first, P.last, P.birthday, L.name as location from checkedOutCharts C, patients P, locations L where C.patientId=P.id and C.locationId=L.id and returnTime=-1 order by P.last, P.first, P.birthday asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// checks out a chart
	obj.checkOutChart = function(listId, first, last, birthday, location, callback) {
		obj.getPatientId(first, last, birthday, function(patientId) {
			obj.getLocationId(location, function(locationId) {
				db.transaction(function(tx) {
					tx.executeSql('select * from checkedOutCharts where patientId=? and returnTime=-1', [patientId], function(tx, results) {
						var len = results.rows.length;
						if(len > 0) {
							callback({
								success: false,
								message: 'Chart already checked out'
							});
						} else {
							var currTime = (new Date()).getTime();
							tx.executeSql('insert into checkedOutCharts(listId, patientId, locationId, checkOutTime, returnTime) values(?,?,?,?,?)',
																	   [listId, patientId, locationId, currTime, -1], function(tx, results) {
								callback({
									success: true,
									insertId: results.insertId
								});
							}, errHandler);
						}
					}, errHandler);
				});
			});
		});
	};

	// delete the checked out record. as if it was never checked out
	obj.deleteCheckedOutChart = function(id, callback) {
		db.transaction(function(tx) {
			tx.executeSql('delete from checkedOutCharts where id=?', [id], function(tx, results) {
				callback({
					success: true
				});
			}, errHandler);
		});
	};

	// returns the chart
	obj.returnChart = function(id, callback) {
		db.transaction(function(tx) {
			var currTime = (new Date()).getTime();
			tx.executeSql('update checkedOutCharts set returnTime=? where id=?', [currTime, id], function(tx, results) {
				callback({
					success: true,
					returnTime: currTime
				});
			}, errHandler);
		});
	};

	obj.unReturnChart = function(id, callback) {
		db.transaction(function(tx) {
			tx.executeSql('update checkedOutCharts set returnTime=-1 where id=?', [id], function(tx, results) {
				callback({
					success: true
				});
			}, errHandler);
		});
	};

	return obj;
}());