(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Spinner
	 *  - přidává překrytí a spinner:
	 *    0. spinner lze zakázat pomocí data-no-spinner - pak se nepokračuje vůbec dál a hotovo.
	 *    1. pokud existuje data-spinner, tak vloží ajax-loader a ajax-overlay do prvku odpovídajícímu selektoru data atributu
	 *    2. pokud není data-spinner, najde se nejbližší ajax-wrap:
	 *       a. pokud uvnitř existuje ajax-spinner, vloží se ajax-loader a ajax-overlay do něj
	 *       b. když ne, vloží se přímo na konec ajax-wrap
	 */
	$.nette.ext('spinner', {
		start: function (xhr, settings) {
			var $placeholder = $();
			var spinner = this;
			settings.spinnerQueue = settings.spinnerQueue || [];

			if (settings.nette) {

				var $el = settings.nette.el;
				var $wrap = null;

				if($el.is('[data-no-spinner]'))
					return;

				$placeholder = $($el.data('spinner'));

				if ($placeholder.length == 0 && ($wrap = $el.closest('.ajax-wrap')).length)
					if (($placeholder = $wrap.find('.ajax-spinner')).length == 0)
						$placeholder = $wrap;

			} else if (settings.spinner) {
				$placeholder = $(settings.spinner);
			}

			if ($placeholder.length) {
				$placeholder.each(function() {
					var i = settings.spinnerQueue.push($(spinner.spinnerHtml));
					$(this).append(settings.spinnerQueue[i-1]);
				});
			}

		},
		complete: function (xhr, status, settings) {
			if (! ('forceRedirect' in xhr) && 'spinnerQueue' in settings) {
				var l = settings.spinnerQueue.length;
				for (var i = 0; i < l; i++) {
					settings.spinnerQueue[i].remove();
				}
			}
		}
	}, {
		spinnerHtml: '<div class="ajax-overlay"></div><div class="ajax-loader"></div>'
	});

})(jQuery);
