var Database = (function() {

	var errHandler = function(tx, err) {
		console.log(err);
	};

	// converts a Transaction result to an Array
	var toArray = function(results) {
		var len = results.rows.length, i, items = [];
		for(i = 0; i < len; i++) {
			items.push(results.rows.item(i));
		}
		return items;
	}

	var db = openDatabase('ct1', '1.0', 'Chart Tracker', 2 * 1024 * 1024);
	db.transaction(function(tx) {


		tx.executeSql('create table if not exists lists(id integer primary key, date integer)', [], null, errHandler);
		tx.executeSql('create table if not exists patients(id integer primary key, first varchar(50), last varchar(50), birthday varchar(50), deleted integer default 0)', [], null, errHandler);
		tx.executeSql('create table if not exists locations(id integer primary key, name varchar(50), deleted integer default 0)', [], null, errHandler);
		tx.executeSql('create table if not exists checkedOutCharts(id integer primary key, listId integer, patientId integer, locationId integer, checkOutTime integer, returnTime integer default -1)', [], null, errHandler);
	});

	// gets all lists sorted by date (desc)
	this.getLists = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from lists order by date desc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// adds a list if it has not been created yet
	this.addList = function(date, callback) {
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
	this.getPatients = function(callback, orderby) {
		db.transaction(function(tx) {
			tx.executeSql('select * from patients where deleted=0 order by last, first, birthday asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// get patient id by first, last name and birthday
	// adds new patient if patient DNE
	this.getPatientId = function(first, last, birthday, callback) {
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
	this.updatePatient = function(id, first, last, birthday, callback) {
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
	this.deletePatient = function(id) {
		db.transaction(function(tx) {
			tx.executeSql('update patients set deleted=1 where id=?', [id], null, errHandler);
		});
	};

	// gets all location; alpha-order
	this.getLocations = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from locations where deleted=0 order by name asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	}

	// get location id by name
	// add new location if location DNE
	this.getLocationId = function(name, callback) {
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
	this.updateLocation = function(id, name, callback) {
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
	this.deleteLocation = function(id) {
		db.transaction(function(tx) {
			tx.executeSql('update locations set deleted=1 where id=?', [id], null, errHandler);
		});
	};

	// gets all checked out charts for the given list
	this.getCheckedOutCharts = function(listId, callback) {
		db.transaction(function(tx) {
			tx.executeSql('select C.*, P.first, P.last, P.birthday, L.name as location from checkedOutCharts C, patients P, locations L where listId=? and C.patientId=P.id and C.locationId=L.id', [listId], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// gets all checked out chart that have not been returned
	this.getOutstandingCharts = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select C.*, P.first, P.last, P.birthday, L.name as location from checkedOutCharts C, patients P, locations L where C.patientId=P.id and C.locationId=L.id and returnTime=-1', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	};

	// checks out a chart
	this.checkOutChart = function(listId, first, last, birthday, location, callback) {
		this.getPatientId(first, last, birthday, function(patientId) {
			this.getLocationId(location, function(locationId) {
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

	return this;
}());