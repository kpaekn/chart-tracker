$.alert = (function() {

	var modal = $('<div class="modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button></div></div></div></div>')
	modal.modal({
		backdrop: 'static',
		show: false
	});
	modal.dialog = modal.find('.modal-dialog');
	modal.content = modal.find('.modal-content');
	modal.body = modal.find('.modal-body');
	modal.footer = modal.find('.modal-footer');
	$('body').append(modal);

	// custom css
	modal.dialog.css('width', 300);
	modal.body.css('padding', 10);
	modal.footer.css({
		'margin': 0,
		'padding': 10
	});

	// functions
	this.show = function(body) {
		modal.body.html(body);
		modal.modal('show');
	};

	return this;
}());