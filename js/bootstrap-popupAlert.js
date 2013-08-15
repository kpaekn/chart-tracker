(function($) {

	$.fn.popupAlert = function(opts) {
		var instance = this;

		var opts = $.extend({
            // These are the defaults.
            'header': null,
            'body': null,
            'width': 350
        }, opts );

		// create dom
		var backdrop = $('<div></div>');
		instance.append(backdrop);
		var popup = $('<div class="popup-alert"><p></p><div></div></div>');
		popup.header = $('<h3></h3>');
		popup.body = popup.find('p');
		popup.footer = popup.find('div');

		if(opts.header) {
			popup.header.html(opts.header);	
			popup.prepend(popup.header);
		}
		popup.body.html(opts.body);
		popup.footer.append('<button class="btn btn-default btn-sm">Close</button>');
		popup.footer.button = popup.footer.find('button');
		instance.append(popup);

		// style
		backdrop.css({
			'background-color': '#fff',
			'display': 'block',
			'opacity': 0.7,
			'position': 'fixed',
			'left': 0,
			'right': 0,
			'top': 0,
			'bottom': 0
		});
		popup.css({
			'background-color': '#fff',
			'border': '1px solid #c4c4c4',
			'box-shadow': '0 0 5px #c4c4c4',
			'position': 'fixed',
			'left': '50%',
			'top': '50%',
			'width': opts.width,
			'margin-left': -(opts.width / 2)
		});
		popup.header.css({
			'margin': 0,
			'padding': 5
		});
		popup.body.css({
			'margin': 10
		});
		popup.footer.css({
			'background-color': '#f1f1f1',
			'padding': 5,
			'text-align': 'right'
		});
		// y position based on height
		popup.css('margin-top', -(popup.outerHeight() / 2));

		// events
		popup.footer.button.click(function(e) {
			backdrop.remove();
			popup.remove();
		});
	};

}(jQuery));