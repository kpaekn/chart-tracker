function Database() {
	var db = openDatabase('mydb', '1.0', 'chart system', 2 * 1024 * 1024);
	// initial create
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY, year INTEGER, month INTEGER, day INTEGER)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS charts (id INTEGER PRIMARY KEY, first VARCHAR(50), last VARCHAR(50), birthday VARCHAR(50))');
		tx.executeSql('CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, name VARCHAR(50))');
	})

	// private functions
	function getList(rows, props) {
		var numRows = rows.length, numProps = props.length, list = [], i, obj, row, prop;
		for(i = 0; i < numRows; i++) {
			obj = {};
			row = rows.item(i);
			for(j = 0; j < numProps; j++) {
				prop = props[j];
				obj[prop] = row[props];
			}
			list.push(obj);
		}
		return list;
	};

	// public functions
	this.getLists = function(process) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM lists', [], function(tx, results) {
				var lists = getList(results.rows, ['id', 'year', 'month', 'day']);
				// dummy data
				lists.push({
					id: 10,
					year: 2013,
					month: 7,
					day: 22
				});
				process(lists);
			});
		});
	};
	this.getCharts = function(process) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM charts', [], function(tx, results) {
				var charts = getList(results.rows, ['id', 'last', 'first', 'birthday']);
				// dummy data
				charts.push({
					id: 63,
					last: 'SMITH',
					first: 'JOHN',
					birthday: ''
				});
				process(charts);
			});
		});
	};
	this.getLocations = function(process) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM locations', [], function(tx, results) {
				var locations = getList(results.row, ['id', 'name']);
				// dummy data
				locations.push({
					id: 563,
					name: 'FRONT DESK'
				});
				process(locations);
			});
		});
	};
	
	return this;
}