var Database = (function() {

	var db = openDatabase('charttracker', '2.0', 'Chart Tracker', 2 * 1024 * 1024);
	db.transaction(function(tx) {
		tx.executeSql('create table if not exists lists(id integer primary key, date integer)');
		tx.executeSql('create table if not exists patients(id integer primary key, first varchar(50), last varchar(50), birthday varchar(50))');
		tx.executeSql('create table if not exists locations(id integer primary key, name varchar(50))');
	});

	// converts a Transaction result to an Array
	var toArray = function(results) {
		var len = results.rows.length, i, items = [];
		for(i = 0; i < len; i++) {
			items.push(results.rows.item(i));
		}
		return items;
	}

	var errHandler = function(tx, err) {
		console.log(err);
	};

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
						console.log(results);
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
		if(!orderby) orderby = 'last, first, birthday asc';
		db.transaction(function(tx) {
			tx.executeSql('select * from patients order by ' + orderby, [], function(tx, results) {
				callback(toArray(results));
			}, function(tx, err) {
				console.log(err);
			}, errHandler);
		});
	};

	// get patient id by first, last name and birthday
	// adds new patient if patient DNE
	this.getPatientId = function(first, last, birthday, callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from patients where first=? and last=? and birthday=?', [first, last, birthday], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					callback(results.rows.item(0).id);
				} else {
					tx.executeSql('insert into patients(first, last, birthday) values(?,?,?)', [first, last, birthday], function(tx, results) {
						callback(results.insertId);
					});
				}
			}, errHandler);
		});
	};

	// gets all location; alpha-order
	this.getLocations = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from locations order by name asc', [], function(tx, results) {
				callback(toArray(results));
			}, errHandler);
		});
	}

	// get location id by name
	// add new location if location DNE
	this.getLocationId = function(name, callback) {
		db.transaction(function(tx) {
			tx.executeSql('select * from locations where name=?', [name], function(tx, results) {
				var len = results.rows.length;
				if(len > 0) {
					callback(results.rows.item(0).id);
				} else {
					tx.executeSql('insert into locations(name) values(?)', [name], function(tx, results) {
						callback(results.insertId);
					}, errHandler);
				}
			}, errHandler);
		});
	};


	this.checkoutChart = function(listId, first, last, birthday, location, callback) {
		this.getPatientId(first, last, birthday, function(patientId) {
			this.getLocationId(location, function(locationId) {

				callback({
					success: true
				});
			});
		});
	};

	return this;
}());