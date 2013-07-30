var MONTHS = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
var DAY_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(time) {
	if(time == -1)
		return 'Not Returned';

	var date = new Date(time),
		month = date.getMonth() + 1,
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		ampm = (hour < 12) ? 'a' : 'p';
	hour = (hour % 12 == 0) ? 12 : (hour % 12);
	min = (min < 10) ? ('0' + min) : min;
	return month + '/' + day + '@' + hour + ':' + min + ampm;
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}