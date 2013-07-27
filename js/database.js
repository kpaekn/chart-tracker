function Database() {
	var thisObj = this;
	var db = openDatabase('mydb', '1.0', 'chart system', 2 * 1024 * 1024);
	// initial create
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY, year INTEGER, month INTEGER, day INTEGER)');

		tx.executeSql('CREATE TABLE IF NOT EXISTS charts (id INTEGER PRIMARY KEY, first VARCHAR(50), last VARCHAR(50), birthday VARCHAR(50))');
		tx.executeSql('CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, name VARCHAR(50))');
		tx.executeSql('CREATE TABLE IF NOT EXISTS charts_checked_out (id INTEGER PRIMARY KEY, list_id, INTEGER, chart_id INTEGER, location_id INTEGER, check_out_time BIGINT, return_time BIGINT default -1, notes VARCHAR(255) default "")');
	})

	// private functions
	function getList(rows, props) {
		var numRows = rows.length, numProps = props.length, list = [], i, obj, row, prop;
		for(i = 0; i < numRows; i++) {
			obj = {};
			row = rows.item(i);
			for(j = 0; j < numProps; j++) {
				prop = props[j];
				obj[prop] = row[prop];
			}
			list.push(obj);
		}
		return list;
	};

	// public functions
	this.getLists = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM lists', [], function(tx, results) {
				var lists = getList(results.rows, ['id', 'year', 'month', 'day']);
				callback(lists);
			});
		});
	};
	this.createList = function(year, month, day, callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM lists WHERE year=? and month=? and day=?', [year, month, day], function(tx, results) {
				if(results.rows.length > 0) {
					callback({
						success: false,
						message: 'A list for ' + month + '/' + day + '/' + year + ' already exists.'
					});
				} else {
					tx.executeSql('INSERT INTO lists(year, month, day) VALUES(?, ?, ?)', [year, month, day], function(tx, results) {
						callback({
							success: true,
							insertId: results.insertId
						});
					});
				}
			});
		});
	};
	this.deleteList = function(id, callback) {
		db.transaction(function(tx) {
			tx.executeSql('DELETE FROM lists WHERE id=?', [id], function(tx, results) {
				callback();
			});
		});
	};

	this.getCharts = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM charts', [], function(tx, results) {
				var charts = getList(results.rows, ['id', 'last', 'first', 'birthday']);
				callback(charts);
			});
		});
	};
	this.createChart = function(last, first, birthday, callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM charts WHERE last=? AND first=? AND birthday=?', [last, first, birthday], function(tx, results) {
				if(results.rows.length > 0) {
					callback({
						id: results.rows.item(0).id
					});
				} else {
					tx.executeSql('INSERT INTO charts(last, first, birthday) VALUES(?, ?, ?)', [last, first, birthday], function(tx, results) {
						callback({
							id: results.insertId
						});
					});
				}
			});
		});
	};

	this.getLocations = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM locations', [], function(tx, results) {
				var locations = getList(results.rows, ['id', 'name']);
				callback(locations);
			});
		});
	};
	this.createLocation = function(name, callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM locations WHERE name=?', [name], function(tx, results) {
				if(results.rows.length > 0) {
					callback({
						id: results.rows.item(0).id
					});
				} else {
					tx.executeSql('INSERT INTO locations(name) VALUES(?)', [name], function(tx, results) {
						callback({
							id: results.insertId
						});
					});
				}
			});
		});
	};

	this.getChartsCheckedOut = function(id, callback) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT CCO.*, C.first, C.last, C.birthday, L.name as location FROM charts_checked_out CCO, charts C, locations L WHERE list_id=? AND L.id=CCO.location_id AND C.id=CCO.chart_id', [id], function(tx, results) {
				var charts = getList(results.rows, ['id', 'return_time', 'check_out_time', 'notes', 'last', 'first', 'birthday', 'location']);
				callback(charts);
			});
		});
	};
	this.checkOutChart = function(listId, last, first, birthday, location, callback) {
		var chartId = -1, locationId = -1;
		var checkOut = function() {
			if(chartId !== -1 && locationId !== -1) {
				db.transaction(function(tx) {
					tx.executeSql('SELECT * FROM charts_checked_out WHERE chart_id=? AND return_time=-1', [chartId], function(tx, results) {
						if(results.rows.length > 0) {
							callback({
								success: false,
								message: 'That chart is already checked out.'
							});
						} else {
							var currTime = (new Date).getTime();
							tx.executeSql('INSERT INTO charts_checked_out(list_id, chart_id, location_id, check_out_time) VALUES(?, ?, ?, ?)', [listId, chartId, locationId, currTime], function(tx, results) {
								callback({
									success: true,
									id: results.insertId,
									check_out_time: currTime
								});
							});
						}
					});
				});
			}
		};
		thisObj.createChart(last, first, birthday, function(data) {
			chartId = data.id;
			checkOut(chartId, locationId);
		});
		thisObj.createLocation(location, function(data) {
			locationId = data.id;
			checkOut(chartId, locationId);
		});
	};
	this.deleteRecord = function(id, callback) {
		db.transaction(function(tx) {
			tx.executeSql('DELETE FROM charts_checked_out WHERE id=?', [id], function(tx) {
				callback();
			});
		});
	};
	this.returnChart = function(id, callback) {
		db.transaction(function(tx) {
			var currTime = (new Date).getTime();
			tx.executeSql('UPDATE charts_checked_out SET return_time=? WHERE id=?', [currTime, id], function(tx, results) {
				callback({
					returnTime: currTime
				});
			});
		});
	}

	this.updateNotes = function(id, notes, callback) {
		db.transaction(function(tx) {
			tx.executeSql('UPDATE charts_checked_out SET notes=? WHERE id=?', [notes, id], function(tx, results) {
				callback();
			});
		});
	};
	
	return this;
}