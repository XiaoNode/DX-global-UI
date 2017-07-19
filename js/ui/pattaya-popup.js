/**
 * Pattaya.Global.UI
 *
 * Required: jQuery
 *
 * Version: 20130306
 *
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("UI", Pattaya.Global)
    
	/**
     * Pattaya.Global.UI.popup
     */
    _ns.popup || (function() {
        var DATA_KEY = "pattaya-global-ui-popup",
            _winCount = 0,
            popup = function(selector, options) {
                var _settings = $.extend(true, {
                    autoOpen: true,
                    autoClose: false,
                    width: '300px',
                    height: 'auto',
                    title: '',
                    popupClass: ''
                }, options || {}),
                    pp;

                $(selector).each(function() {
                    var $this = $(this);
                    var db = $this.data(DATA_KEY);
                    if (db && db.popup) {
                        if (!options) {
                            if (pp === undefined) {
                                pp = db.popup;
                            }
                            return;
                        } else {
                            db.popup.unload();
                        }
                    }

                    var _popupId, _popupContainer, _loaded = false,
                        show = function() {
                            if (!_loaded) {
                                return;
                            }
                            _popupContainer.show();
                        },
                        hide = function() {
                            if (!_loaded) {
                                return;
                            }
                            _popupContainer.hide();
                        },
                        pos = function(opt) {
                            if (!_loaded) {
                                return;
                            }

                            if (opt) {
                                _popupContainer.css({
                                    'left': opt.left,
                                    'top': opt.top
                                });
                            } else {
                                return _popupContainer.offset();
                            }
                        },
                        unload = function() {
                            if (_popupContainer === undefined) {
                                return;
                            }

                            $this.removeData(DATA_KEY);

                            $this.parent().siblings().remove();
                            $this.unwrap().unwrap();

                            _loaded = false;
                            _popupContainer = undefined;
                        },
                        _initDOM = function() {
                            _winCount += 1;

                            var format = Pattaya.Global.Utils.format,
                                _timestamp = +(new Date()),
                                _popupId = format('pattaya-popup-{winCount}{timestamp}', {
                                    'winCount': _winCount,
                                    'timestamp': _timestamp
                                }),
                                wrapHtml = format('<div id="{id}" class="pop_wrapper {popupClass}" style="width: {width}; height: {height}; display: none; z-index: {zIndex};"><div class="bd"></div></div>', {
                                    'id': _popupId,
                                    'popupClass': _settings.popupClass,
                                    'width': _settings.width,
                                    'height': _settings.height,
                                    'zIndex': Pattaya.Global.UI.zIndex.getLatest()
                                }),
                                headHtml = format('<div class="hd"><h2>{title}</h2></div>', {
                                    'title': _settings.title
                                }),
                                closeHtml = '<a class="close">close</a>';

                            $this.wrap(wrapHtml);
                            _popupContainer = $('#' + _popupId);

                            $(headHtml).append(closeHtml).prependTo(_popupContainer);
                        },
                        _bindEvents = function() {
                            _popupContainer.on('click', "div.hd>a.close", hide);

                            if (_settings.autoClose) {
                                _popupContainer.on('click', function(e) {
                                    e.stopPropagation();
                                });
                                $('html').on('click', hide);
                            }
                        },
                        _init = function() {
                            _initDOM();
                            _bindEvents();
                            _loaded = true;

                            if (_settings.autoOpen) {
                                show();
                            }
                        },
                        popupInstance = {
                            show: show,
                            hide: hide,
                            pos: pos,
                            unload: unload
                        };

                    _init();

                    if (pp === undefined) {
                        pp = popupInstance;
                    }

                    $this.data(DATA_KEY, {
                        popup: popupInstance
                    });
                });

                return pp;
            };

        popup.__version = "20111227";
        $.extend(true, _ns, {
            popup: popup
        });
    }());
	
}(this, Pattaya, jQuery));
