/**
 * nette.ajax.js extension allowing to create disabled-by-deafult extensions
 *
 * @copyright Copyright (c) 2015-2016 Radek Šerý
 * @copyright Copyright (c) 2015      Jiří Pudil
 * @license MIT
 *
 * @version 1.0.3
 */
(function ($, undefined) {
	var extensions = {};
	var contexts = {};


	// Cleverer ajaxification
	$.nette.ext('init', false);
	$.nette.ext('init', {
		load: function (rh) {
			$(document).off('click.nette', this.linkSelector, rh).on('click.nette', this.linkSelector, rh);
			$(document).off('submit.nette', this.formSelector, rh).on('submit.nette', this.formSelector, rh);
			$(document).off('click.nette', this.buttonSelector, rh).on('click.nette', this.buttonSelector, rh);
		}
	}, {
		linkSelector: 'a.ajax',
		formSelector: 'form.ajax',
		buttonSelector: 'input.ajax[type="submit"], form.ajax input[type="submit"], button.ajax[type="submit"], form.ajax button[type="submit"], input.ajax[type="image"], form.ajax input[type="image"]'
	});

	// Allows calling $.nette.pd.ext('foo') to get pd extension context (same as $.nette.ext('bar') for common extension)
	$.nette.pd = {
		ext: function (name, callbacks, context) {
			if (callbacks === undefined) {
				return contexts[name];
			} else if (typeof name === 'string' && contexts[name] !== undefined) {
				throw "Cannot override already registered pd-ajax extension '" + name + "'.";
			} else {
				var extension = {};
				$.each(callbacks, function (event, callback) {
					extension[event] = $.proxy(callback, context);
				});
				extensions[name] = extension;
				contexts[name] = $.extend(context ? context : {}, {
					name: function () {
						return name;
					},
					ext: function (name, force) {
						var ext = $.nette.ext(name);
						var extPd = contexts[name];
						if (!(ext || extPd) && force) throw "Extension '" + this.name() + "' depends on disabled extension '" + name + "'.";
						return ext ? ext : extPd;
					}
				});
			}
		}
	};

	var getEnabledExtensions = function (settings) {
		if (settings.pd) {
			return settings.pd;
		}
		if (settings.nette) {
			var ext = '';
			if (settings.nette.el.attr('data-ajax-pd')) {
				ext = settings.nette.el.attr('data-ajax-pd');
			}
			if (! settings.nette.isForm && settings.nette.form && settings.nette.form.attr('data-ajax-pd')) {
				ext = ((ext === '') ? '' : ext + ' ') + settings.nette.form.attr('data-ajax-pd');
			}
			return ext === '' || ext.split(' ');
		}

		return true;
	};


	$.nette.ext('pd', {
		init: function () {
			$.each(extensions, function (name, ext) {
				if (ext['init']) {
					ext.init();
				}
			});
		},
		load: function (handler) {
			$.each(extensions, function (name, ext) {
				if (ext['load']) {
					ext.load(handler);
				}
			});
		},
		prepare: function (settings) {
			var on = getEnabledExtensions(settings);
			$.each(extensions, function (name, ext) {
				if (ext['prepare'] && $.inArray(name, on) !== -1) {
					ext.prepare(settings);
				}
			});
		},
		before: function (xhr, settings) {
			var on = getEnabledExtensions(settings);
			var abort = false;
			$.each(extensions, function (name, ext) {
				if (ext['before'] && $.inArray(name, on) !== -1) {
					if (ext.before(xhr, settings) === false) {
						abort = true;
					}
				}
			});
			return !abort;
		},
		start: function (xhr, settings) {
			var on = getEnabledExtensions(settings);
			$.each(extensions, function (name, ext) {
				if (ext['start'] && $.inArray(name, on) !== -1) {
					ext.start(xhr, settings);
				}
			});
		},
		success: function (payload, status, xhr, settings) {
			var on = getEnabledExtensions(settings);
			$.each(extensions, function (name, ext) {
				if (ext['success'] && $.inArray(name, on) !== -1) {
					ext.success(payload, status, xhr, settings);
				}
			});
		},
		complete: function (xhr, status, settings) {
			var on = getEnabledExtensions(settings);
			$.each(extensions, function (name, ext) {
				if (ext['complete'] && $.inArray(name, on) !== -1) {
					ext.complete(xhr, status, settings);
				}
			});
		},
		error: function (xhr, status, error, settings) {
			var on = getEnabledExtensions(settings);
			$.each(extensions, function (i, ext) {
				if (ext['error'] && $.inArray(name, on) !== -1) {
					ext.error(xhr, status, error, settings);
				}
			});
		}
	});


	// rozšíření extension snippets o nové funkce
	var snippetsExt = $.nette.ext('snippets');

	// najde a vrátí všechny snippety, které nemají zakázané cacheování
	snippetsExt.findSnippets = function () {
		var result = [];
		$('[id^="snippet-"]').each(function () {
			var $el = $(this);
			if (! $el.is('[data-history-nocache]')) {
				result.push({
					id: $el.attr('id'),
					html: $el.html()
				});
			}
		});
		return result;
	};

})(jQuery);
