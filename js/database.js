function Database() {
	var db = openDatabase('mydb', '1.0', 'chart system', 2 * 1024 * 1024);
	// initial create
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY, year INTEGER, month INTEGER, day INTEGER)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS charts (id INTEGER PRIMARY KEY, first VARCHAR(50), last VARCHAR(50), birthday VARCHAR(50))');
	})

	// private functions

	// public functions
	this.getLists = function(process) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM lists', [], function(tx, results) {
				var len = results.rows.length, lists = [], i;
				for(i = 0; i < len; i++) {
					lists[i] = {
						id: results.rows.item(i).id,
						year: results.rows.item(i).year,
						month: results.rows.item(i).month,
						day: results.rows.item(i).day
					}
				}
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
				var len = results.rows.length, charts = [], i;
				for(i = 0; i < len; i++) {
					charts[i] = {
						last: results.rows.item(i).last,
						first: results.rows.item(i).first,
						birthday: results.rows.item(i).birthday
					}
				}
				// dummy data
				charts.push({
					last: 'SMITH',
					first: 'JOHN',
					birthday: ''
				});
				process(charts);
			});
		});
	};
	
	return this;
}