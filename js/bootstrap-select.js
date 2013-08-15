(function($) {

	$.fn.selectpicker = function() {
		var instance = this;
		instance.css('display', 'none');

		// create dom
		var dropdown = $('<div class="btn-group"></div>');
		dropdown.button = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><div></div> <span class="caret"></span></button>');
		dropdown.button.text = dropdown.button.find('div');
		dropdown.list = $('<ul class="dropdown-menu"></ul>');
		dropdown.append(dropdown.button, dropdown.list);
		instance.after(dropdown);

		// set style
		dropdown.button.css('text-align', 'left');
		dropdown.button.find('.caret').css({
			'position': 'absolute',
			'right': 12,
			'top': 14
		});

		// set width
		var width = instance.attr('data-width');
		if(width) {
			dropdown.button.css('width', width);
			dropdown.list.css('width', width);
		}

		// populate list with options
		instance.find('option').each(function(i, el) {
			var item = $('<li><a href="#"><span class="text"></span> <small></small></a></li>');
			item.a = item.find('a');
			item.text = item.a.find('.text');
			item.subtext = item.a.find('small');

			item.a.attr('val', $(el).attr('value'));
			item.text.html($(el).html());
			item.subtext.html($(el).attr('data-subtext'));
			dropdown.list.append(item);
		});

		// add events
		dropdown.list.find('a').click(function(e) {
			e.preventDefault();
			var link = $(e.currentTarget);
			var text = link.find('.text').html();
			var value = link.attr('val');
			if(!value)
				value = text;
			dropdown.button.text.html(link.html());
			instance.val(value);
		}).first().click();
	};

}(jQuery));