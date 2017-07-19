(function(root, $, undefined) {
    "use strict";
    root.Pattaya = $.extend(true, root.Pattaya, {});
}(this, jQuery));

/**
 * Pattaya.Global.ns
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var tp = function(v) {
            return Object.prototype.toString.call(v);
        },
        ns = function(strNamespace, root) {
            if (tp(strNamespace) !== "[object String]") {
                return;
            }
            var arr = strNamespace.split(/[\s|\.]+/);
            var l = arr.length,
                i = 0,
                curNS, c, p = root;
            if (p === undefined) {
                p = window;
            } 
            for (; i < l; i++) {
                curNS = arr[i];
                if (curNS === '') {
                    continue;
                }
                c = p[curNS];
                if (c === undefined) {
                    p[curNS] = c = {};
                }
                p = c;
            }
            return p;
        };
    ns.__version = "20111113";
    Pattaya.Global = $.extend(true, Pattaya.Global, {
        ns: ns
    });
}(this, Pattaya, jQuery));

/**
 * Pattaya.Global.UI
 *
 * Required: jQuery
 *
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("UI", Pattaya.Global),
        KEYS = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            DEL: 46,
            TAB: 9,
            RETURN: 13,
            ESC: 27,
            COMMA: 188,
            PAGEUP: 33,
            PAGEDOWN: 34,
            BACKSPACE: 8
        };

    /**
     * Pattaya.Global.UI.Screen
     */
    (function() {
        var _screenNS = Pattaya.Global.ns("Screen", _ns);

        /**
         * Pattaya.Global.UI.Screen.getDimensions
         */
        _screenNS.getDimensions || (function() {
            var getDimensions = function() {
                    var xScroll, yScroll, pageWidth, pageHeight, windowWidth, windowHeight, docWidth, docHeight, document = window.document,
                        documentElement = document.documentElement,
                        body = document.body,
                        Math = window.Math,
                        self = window.self;

                    if (window.innerHeight && window.scrollMaxY) {
                        xScroll = window.innerWidth + window.scrollMaxX;
                        yScroll = window.innerHeight + window.scrollMaxY;
                    } else if (body.scrollHeight > body.offsetHeight) { // all but Explorer Mac
                        xScroll = body.scrollWidth;
                        yScroll = body.scrollHeight;
                    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
                        xScroll = body.offsetWidth;
                        yScroll = body.offsetHeight;
                    }

                    if (self && self.innerHeight) { // all except Explorer
                        if (documentElement && documentElement.clientWidth) {
                            windowWidth = documentElement.clientWidth;
                        } else {
                            windowWidth = self.innerWidth;
                        }
                        windowHeight = self.innerHeight;
                    } else if (documentElement && documentElement.clientHeight) { // Explorer 6 Strict Mode
                        windowWidth = documentElement.clientWidth;
                        windowHeight = documentElement.clientHeight;
                    } else if (body) { // other Explorers
                        windowWidth = body.clientWidth;
                        windowHeight = body.clientHeight;
                    }
                    // for small pages with total height less then height of the viewport
                    if (yScroll < windowHeight) {
                        pageHeight = windowHeight;
                    } else {
                        pageHeight = yScroll;
                    }
                    // for small pages with total width less then width of the viewport
                    if (xScroll < windowWidth) {
                        pageWidth = xScroll;
                    } else {
                        pageWidth = windowWidth;
                    }

                    docHeight = Math.max(body.scrollHeight || 0, body.offsetHeight || 0, body.clientHeight || 0);
                    docWidth = Math.max(body.scrollWidth || 0, body.offsetWidth || 0, body.clientWidth || 0);
                    if (documentElement) {
                        docHeight = Math.max(docHeight, documentElement.scrollHeight || 0, documentElement.offsetHeight || 0, documentElement.clientHeight || 0);
                        docWidth = Math.max(docWidth, documentElement.scrollWidth || 0, documentElement.offsetWidth || 0, documentElement.clientWidth || 0);
                    }

                    return {
                        'pageWidth': pageWidth,
                        'pageHeight': pageHeight,
                        'windowWidth': windowWidth,
                        'windowHeight': windowHeight,
                        'docWidth': docWidth,
                        'docHeight': docHeight
                    };
                };
            getDimensions.__version = "20111229";

            $.extend(true, _screenNS, {
                getDimensions: getDimensions
            })
        }());
    }());

    /**
     * numerical
     *
     * Required: jQuery.caret
     *
     */
    _ns.numerical || (function() {
        var DATA_KEY = "pattaya-global-ui-numeric",
			DATA_CHANGED_TIMEOUT = "data-changed-timeout";
        var numerical = function(filter, options) {
                var $this = $(filter);
                if (!options) {
                    var db = $this.data(DATA_KEY);
                    if (db) {
                        return db.numeric;
                    }
                }
                var _settings = $.extend(true, {}, {
                    step: 1,
                    decCtrl: undefined,
                    incCtrl: undefined,
                    max: undefined,
                    min: undefined,
                    defaultValue: 0,
                    decimal: false,
                    decimalDelimiter: '.',
                    decimalPrecision: 2,
                    onValueChanging: undefined,
                    onValueChanged: undefined,
					delay: 400,
                    styles: {
                        error: 'error'
                    }
                }, options);
                _settings.isEnabled = true;
                var _preValue, 
					_change = function(diff) {
                        if (!_settings.isEnabled) {
                            return;
                        }
                        var v = $this.val(),
                            nv;
                        if (_settings.decimal) {
                            v = v.replace(_settings.decimalDelimiter, ".");
                            v = parseFloat(v);
                        } else {
                            v = parseInt(v, 10);
                        }
                        if (isNaN(v)) {
                            v = _settings.defaultValue;
                        }
                        nv = v + diff;
                        if ((_settings.min || _settings.min === 0) && nv < _settings.min) {
                            nv = _settings.min;
                        } else if ((_settings.max || _settings.max === 0) && nv > _settings.max) {
                            nv = _settings.max;
                        }
						
						//event: onValueChanging 
                        if (nv !== _preValue && _settings.onValueChanging) {
                            if (!_settings.onValueChanging(nv, _preValue)) {
                                return;
                            }
                        }
						
						//set value
                        var strV = nv;
                        if (_settings.decimal) {
                            strV = strV.toFixed(_settings.decimalPrecision);
                            strV = strV.replace(".", _settings.decimalDelimiter);
                        }
                        $this.val(strV);
						
						//event: onValueChanged
                        if (nv !== _preValue && _settings.onValueChanged) {
							if(_settings.delay) {
								var tm = $this.data(DATA_CHANGED_TIMEOUT);
								
								if(tm) {
									clearTimeout(tm);
								}
								
								$this.data(DATA_CHANGED_TIMEOUT, setTimeout(function(){
									_settings.onValueChanged(nv, _preValue);
									_preValue = nv;
								}, _settings.delay));
							} else {
								_settings.onValueChanged(nv, _preValue);
								_preValue = nv;
							}
                        }
                    },
                    increase = function() {
                        _change(_settings.step);
                    },
                    decrease = function() {
                        _change(-1 * _settings.step);
                    },
                    currentValue = function() {
                        return _preValue;
                    },
                    _onKeyDown = function(event) {
                        var keyCode = event.keyCode;
                        var isMinusAcceptable = function() {
                                if (_settings.min && _settings.min >= 0) {
                                    return false;
                                }
                                if (currentValue() < 0) {
                                    return false;
                                }
                                if ($this.caret) {
                                    var caret = $this.caret(),
                                        noExistingDashFound = $this.val().indexOf('-') === -1;
                                    return caret.start === 0 && noExistingDashFound;
                                }
                                return true;
                            };
                        // Allow backspace, delete and decimal delimiter
                        if (keyCode === 46 || keyCode === 8 || keyCode === 37 || keyCode === 39 || (_settings.decimal && ((_settings.decimalDelimiter === '.' && (keyCode === 190 || keyCode === 110)) || (_settings.decimalDelimiter === ',' && keyCode === 188)))) {
                            return;
                        } else if (keyCode === 189 || keyCode === 109) { // minus sign
                            if (!isMinusAcceptable()) {
                                event.preventDefault();
                            } else {
                                return;
                            }
                        } else if (keyCode === 38) {
                            // up
                            increase();
                        } else if (keyCode === 40) {
                            // down
                            decrease();
                        } else if (keyCode === 13) {
                            // enter
                            $this.trigger('change');
                        } else {
                            // Ensure that it is a number and stop the keypress
                            if ((keyCode < 48 || keyCode > 57) && (keyCode < 96 || keyCode > 105)) {
                                event.preventDefault();
                            }
                        }
                    },
                    _onValueChange = function() {
                        _change(0);
                    },
                    unload = function() {
                        var db = $this.data(DATA_KEY);
                        if (db !== undefined) {
                            if (db.settings) {
                                if (db.settings.decCtrl) {
                                    $(db.settings.decCtrl).unbind('click', decrease);
                                }
                                if (db.settings.incCtrl) {
                                    $(db.settings.incCtrl).unbind('click', increase);
                                }
                            }
                            $this.unbind('change', _onValueChange).unbind('keydown', _onKeyDown);
                            $this.removeData(DATA_KEY);
                        }
                    },
                    _init = function() {
                        if (!$this.is("INPUT[type='text']")) {
                            return;
                        }
                        unload();
                        if (_settings.incCtrl) {
                            $(_settings.incCtrl).click(increase);
                        }
                        if (_settings.decCtrl) {
                            $(_settings.decCtrl).click(decrease);
                        }
                        $this.bind({
                            keydown: _onKeyDown,
                            change: _onValueChange
                        });
                        if ($this.attr("disabled")) {
                            disable();
                        }
                    },
                    enable = function() {
                        _settings.isEnabled = true;
                        $this.removeAttr("disabled");
                    },
                    disable = function() {
                        _settings.isEnabled = false;
                        $this.attr("disabled", "disabled");
                    };
                _init();
                var numeric = {
                    increase: increase,
                    decrease: decrease,
                    unload: unload,
                    currentValue: currentValue,
                    enable: enable,
                    disable: disable
                };
                $this.data(DATA_KEY, {
                    numeric: numeric,
                    settings: _settings
                });
                $this.trigger('change');
                return numeric;
            };
        numerical.__version = "20111114";
        $.extend(true, _ns, {
            numerical: numerical
        });
    }());

    /**
     * Pattaya.Global.UI.tabs
     */
     _ns.tabs || (function() {
        var DATA_KEY = "pattaya-global-ui-tabs";
        var tabs = function(selector, options) {
                options = $.extend(true, {
					active: -1,
                    trigger: 'click',
					triggerInterval: 150, //for trigger: mouseover, mouseenter
                    onChanging: undefined,
                    onChanged: undefined
                }, options);
				
                var DATA_TABS_TRIGGER_TIMEOUT = "data-tabs-trigger-timeout",
				
					activate = function(element, container) {
                        container.find('> .active').removeClass('active');
                        element.addClass('active');
                    },
                    tab = function(e) {
                        var $this = $(this),
                            $ul = $this.closest('ul'),
                            href = $this.attr('href'),
                            previous, $href;
                        if (/^#\w+/.test(href)) {
                            e.preventDefault();
                            if ($this.parent('li').hasClass('active')) {
                                return;
                            }
                            previous = $ul.find('.active a').last()[0];
                            $href = $(href);
                            if (options.onChanging && options.onChanging(previous, this) === false) {
                                return;
                            }
                            activate($this.parent('li'), $ul);
                            activate($href, $href.parent());
                            if (options.onChanged) {
                                options.onChanged(previous, this);
                            }
                        }
                    },
                    init = function() {
                        $(selector).each(function(index) {
							var $this = $(this),
								arrTrigger = options.trigger.split(' ');
							
							$.each(arrTrigger, function(index, trigger){
								if($.inArray(trigger, ["mouseover", "mouseenter"]) < 0 ) {
									$this.on(trigger, "li > a", tab);
								} else {
									$this.on("mouseover", "li > a", function(e){
										var curTrigger = $(this);
										
										if(options.triggerInterval) {
											curTrigger.data(
												DATA_TABS_TRIGGER_TIMEOUT, 
												setTimeout(function(){
													tab.call(curTrigger, e);
												}, options.triggerInterval)
											);
										} else {
											tab.call(curTrigger, e);
										}
									}).on("mouseout", function(){
										var timeout = $(this).data(DATA_TABS_TRIGGER_TIMEOUT);
										
										if(timeout) {
											clearTimeout(timeout);
										}
									});
								}
							});
							
							//active the zero-based index of item
 							$("li > a", $this).eq(options.active).trigger(arrTrigger[0]);
                        });
                    };
                init();
            };
        tabs.__version = "20111121";
        $.extend(true, _ns, {
            tabs: tabs
        });
    }());

    /**
     * Pattaya.Global.UI.dropdown
     */
    _ns.dropdown || (function() {
        var DATA_KEY = "pattaya-global-ui-dropdown";
        var VALID_EFFECTS = ['slideDown', 'fadeIn'];
        var dropdown = function(selector, options) {
                var _settings = $.extend(true, {
                    onChanging: undefined,
                    onChanged: undefined,
                    // click or mouseover
                    trigger: "mouseover",
                    // select or menu that trigger different behaviour when item clicked
                    type: 'select',
                    // delay to hide in mouse in/out mode
                    delay: 20,
                    fx: {
                        // effects: slideDown or none
                        type: 'slideDown',
                        duration: 200
                    }
                }, options),
                    dd, timer;
                var _hideAllDropdowns = function(e) {
                        $(".dropdown").each(function(index) {
                            var $this = $(this);
                            $this.find("> a").removeClass('hovered');
                            $this.find("> div, > ul").hide();
                        });
                    };
                $('html').on('click', _hideAllDropdowns);
                $(selector).each(function(index) {
                    var $this = $(this),
                        _isEnabled = true;
                    if (!options) {
                        var db = $this.data(DATA_KEY);
                        if (db && db.dropdown) {
                            if (dd === undefined) {
                                dd = db.dropdown;
                            }
                            return;
                        }
                    }
                    var a = $this.find("> a"),
                        b = $this.find("> div, > ul"),
                        hide = function() {
                            a.removeClass('hovered');
                            b.hide();
                        },
                        show = function() {
                            if (!_isEnabled || a.hasClass('hovered')) {
                                return;
                            }
                            _hideAllDropdowns();
                            a.addClass('hovered');
                            var tp = $.type(_settings.fx);
                            if (tp === 'object' && _settings.fx.type && Pattaya.Global.Utils.contains(VALID_EFFECTS, _settings.fx.type)) {
                                b[_settings.fx.type](_settings.fx.duration);
                            } else if (tp === 'string' && Pattaya.Global.Utils.contains(VALID_EFFECTS, _settings.fx)) {
                                b[_settings.fx]();
                            } else {
                                b.show();
                            }
                        },
                        _triggerClicked = function(e) {
                            e.preventDefault();
                            show();
                            e.stopPropagation();
                        },
                        _itemClicked = function(e) {
                            var $item = $(this);
                            if (_settings.onChanging && _settings.onChanging.call($this, $item) === false) {
                                return;
                            }
                            if (_settings.type === 'select') {
                                a.html($item.html());
                            }
                            if (_settings.onChanged) {
                                _settings.onChanged.call($this, $item);
                            }
                        },
                        _triggerMouseover = function(e) {
                            if (timer) {
                                clearTimeout(timer);
                                timer = undefined;
                            }
                            show();
                        },
                        _itemMouseover = function() {
                            if (timer) {
                                clearTimeout(timer);
                                timer = undefined;
                            }
                        },
                        _triggerOrItemMouseout = function() {
                            timer = setTimeout(hide, _settings.delay);
                        },
                        unload = function() {
                            var db = $this.data(DATA_KEY);
                            if (db != undefined) {
                                if (db.settings) {
                                    var t = db.settings.trigger;
                                    switch (t) {
                                    case 'mouseover':
                                        a.off({
                                            'mouseover': _triggerMouseover,
                                            'mouseout': _triggerOrItemMouseout
                                        });
                                        b.off({
                                            'mouseover': _itemMouseover,
                                            'mouseout': _triggerOrItemMouseout
                                        });
                                        break;
                                    case 'click':
                                        a.off(t, _triggerClicked);
                                        break;
                                    }
                                    b.off('click', 'li', _itemClicked);
                                }
                            }
                        },
                        _init = function() {
                            unload();
                            switch (_settings.trigger) {
                            case 'click':
                                a.on('click', _triggerClicked);
                                break;
                            case 'mouseover':
                                a.on({
                                    'mouseover': _triggerMouseover,
                                    'mouseout': _triggerOrItemMouseout
                                });
                                b.on({
                                    'mouseover': _itemMouseover,
                                    'mouseout': _triggerOrItemMouseout
                                });
                                break;
                            default:
                                throw 'Not supported dropdown trigger method ' + _settings.trigger;
                            }
                            b.on('click', 'li', _itemClicked);
                            $this.addClass('dropdown');
                        },
                        enable = function() {
                            _isEnabled = true;
                        },
                        disable = function() {
                            _isEnabled = false;
                        };
                    var dropd = {
                        show: show,
                        hide: hide,
                        unload: unload,
                        enable: enable,
                        disable: disable
                    };
                    _init();
                    $this.data(DATA_KEY, {
                        dropdown: dropd,
                        settings: _settings
                    });
                    dd = dropd;
                });
                return dd;
            };
        dropdown.__version = "20111123";
        $.extend(true, _ns, {
            dropdown: dropdown
        });
    }());

    _ns.zIndex || (function() {
        var _index = 1000,
            zIndex = {
                __version: '20111227',
                getLatest: function() {
                    _index += 1;
                    return _index;
                }
            };

        $.extend(true, _ns, {
            zIndex: zIndex
        });
    }());

    /**
     * Pattaya.Global.UI.selection
     */
    _ns.selection || (function() {
        var DATA_KEY = "pattaya-global-ui-selection",
            ITEM_DATA_KEY = "pattaya-global-ui-selection-data",
            selection = function(selector, options) {
                var _settings = $.extend(true, {
                    width: undefined,
                    height: undefined,
                    loop: false,
                    valueChanged: undefined,
                    itemClicked: undefined
                }, options || {}),
                    sel;

                $(selector).each(function() {
                    var $this = $(this);
                    var db = $this.data(DATA_KEY);
                    if (db && db.selection) {
                        if (!options) {
                            if (sel === undefined) {
                                sel = db.selection;
                            }
                            return;
                        } else {
                            db.selection.unload();
                        }
                    }

                    var _items, _loaded = false,
                        _enabled = true,
                        _activeIndex = -1,
                        _activeItem, _visible = false,
                        ITEMS_CONTAINER_PATTERN = ' >ul',
                        ITEMS_PATTERN = ' >ul>li',
                        ACTIVE_CLASS_NAME = 'active',
                        _selectItem = function(item, index, scroll) {
                            if (_activeItem) {
                                _activeItem.removeClass(ACTIVE_CLASS_NAME);
                            }

                            _activeIndex = index;
                            _activeItem = item;
                            _activeItem.addClass(ACTIVE_CLASS_NAME);

                            // scroll
                            if (scroll) {
                                var offset = 0,
                                    panelHeight = $this.height(),
                                    activeItemHeight = _activeItem.outerHeight(),
                                    currentScrollTop = $this.scrollTop(),
                                    newScrollTop, i = 0;
                                for (; i < _activeIndex; i++) {
                                    offset += $(_items[i]).outerHeight();
                                }
                                if (offset + activeItemHeight - currentScrollTop > panelHeight) {
                                    newScrollTop = offset + activeItemHeight - $this.innerHeight();
                                } else if (offset < currentScrollTop) {
                                    newScrollTop = offset;
                                }

                                if (newScrollTop !== undefined) {
                                    $this.scrollTop(newScrollTop);
                                }
                            }

                            // value changed event
                            if (_settings.valueChanged) {
                                _settings.valueChanged(_activeItem, _activeItem.data(ITEM_DATA_KEY));
                            }
                        },
                        _move = function(step) {
                            if (!_enabled) {
                                return;
                            }

                            var newItemCssIndex, newItem, length = _items.length,
                                preveIndex = _activeIndex;

                            if (length === 0) {
                                return;
                            }

                            _activeIndex += step % length;
                            if (_activeIndex < 0) {
                                _activeIndex = _settings.loop ? length - 1 : 0;
                            } else if (_activeIndex >= length) {
                                _activeIndex = _settings.loop ? 0 : length - 1;
                            }

                            if (preveIndex === _activeIndex) {
                                return;
                            }

                            newItemCssIndex = _activeIndex + 1;
                            newItem = $this.find(ITEMS_PATTERN + ':nth-child(' + newItemCssIndex + ')');

                            _selectItem(newItem, _activeIndex, true);
                        },
                        prev = function() {
                            _move(-1);
                        },
                        next = function() {
                            _move(1);
                        },
                        disable = function() {
                            _enabled = false;
                            hide();
                        },
                        enable = function() {
                            _enabled = true;
                        },
                        pos = function(opt) {
                            if (!_enabled) {
                                return;
                            }

                            if (opt) {
                                $this.css({
                                    'left': opt.left,
                                    'top': opt.top
                                });
                            } else {
                                return $this.offset();
                            }
                        },
                        current = function() {
                            var v;

                            if (_activeItem) {
                                v = {
                                    item: _activeItem,
                                    data: _activeItem.data(ITEM_DATA_KEY)
                                };
                            }

                            return v;
                        },
                        _bindEvents = function() {
                            _items.each(function(index) {
                                var $item = $(this);
                                $item.on({
                                    'click': function() {
                                        if (_settings.itemClicked) {
                                            _settings.itemClicked($item, $item.data(ITEM_DATA_KEY));
                                        }
                                    },
                                    'mouseover': function() {
                                        _selectItem($item, index, false);
                                    }
                                });
                            });
                        },
                        unload = function() {
                            _activeIndex = -1;
                            disable();

                            _items.off('mouseover click');
                        },
                        _load = function() {
                            _items = $this.find(ITEMS_PATTERN);

                            _bindEvents();
                            enable();
                        },
                        setItems = function(elements, funcItemHtmlBuilder) {
                            unload();

                            var str = '',
                                i = 0,
                                l = elements ? elements.length : 0,
                                format = Pattaya.Global.Utils.format,
                                itemsContainer = $this.find(ITEMS_CONTAINER_PATTERN),
                                element, itemHtml;
                            itemsContainer.html('');
                            for (; i < l; i++) {
                                element = elements[i];
                                if (funcItemHtmlBuilder) {
                                    itemHtml = funcItemHtmlBuilder(element);
                                } else {
                                    itemHtml = element.text || element;
                                }
                                str = format('<li>{0}</li>', itemHtml);
                                $(str).data(ITEM_DATA_KEY, element).appendTo(itemsContainer);
                            }

                            _load();
                        },
                        show = function() {
                            if (!_enabled) {
                                return;
                            }

                            $this.css({
                                'zIndex': Pattaya.Global.UI.zIndex.getLatest()
                            }).show();
                            _visible = true;
                        },
                        hide = function() {
                            $this.hide();
                            _visible = false;
                        },
                        isVisible = function() {
                            return _visible;
                        },
                        _init = function() {
                            if (_settings.width) {
                                $this.css('width', width);
                            }
                            if (_settings.height) {
                                $this.css('height', height);
                            }

                            $this.addClass('selection');

                            _load();
                        },
                        selectionInstance = {
                            current: current,
                            prev: prev,
                            next: next,

                            unload: unload,

                            enable: enable,
                            disable: disable,

                            setItems: setItems,

                            show: show,
                            hide: hide,
                            isVisible: isVisible,

                            pos: pos
                        };

                    _init();

                    if (sel === undefined) {
                        sel = selectionInstance;
                    }

                    $this.data(DATA_KEY, {
                        selection: selectionInstance
                    });
                });

                return sel;
            };

        selection.__version = "20120114";
        $.extend(true, _ns, {
            selection: selection
        });
    }());

    /**
     * Pattaya.Global.UI.autocomplete
     */
    _ns.autocomplete || (function() {
        var DATA_KEY = "pattaya-global-ui-autocomplete",
            acCount = 0,
            autocomplete = function(selector, options) {
                var _settings = $.extend(true, {
                    delay: 200,
                    valueChanged: undefined,
                    itemClicked: undefined,
                    offset: undefined,
                    width: undefined,
                    height: undefined
                }, options || {}),
                    ac;

                $(selector).each(function() {
                    var $this = $(this);
                    var db = $this.data(DATA_KEY);
                    if (db && db.autocomplete) {
                        if (!options) {
                            if (ac === undefined) {
                                ac = db.autocomplete;
                            }
                            return;
                        } else {
                            db.autocomplete.unload();
                        }
                    }

                    var _selection, _selectionId, keywords = [],
                        recommendations = [],
                        _enabled = false,
                        disable = function() {
                            _enabled = false;
                        },
                        enable = function() {
                            _enabled = true;
                        },
                        unload = function() {
                            $this.off({
                                'keydown': _keyDownEventHandler,
                                'keyup': _keyUpEventHandler
                            });
                            $('html').off('click', _hideRecommendations);
                            _selection.unload();
                        },
                        setRecommendations = function(data) {
                            recommendations = data;
                            if (!data || !data.length) {
                                _hideRecommendations();
                            }

                            var keyword, l = keywords.length;

                            if (l > 0) {
                                keyword = keywords[l - 1];
                                keywords = keywords.slice(0, l - 1);
                            }

                            _selection.setItems(data, function(item) {
                                var text;
                                if (keyword) {
                                    var kIndex = item.toLowerCase().indexOf(keyword);
                                    if (kIndex !== -1) {
                                        text = item.substr(0, kIndex) + '<b>' + item.substr(kIndex, keyword.length) + '</b>' + item.substring(kIndex + keyword.length);
                                    }
                                }

                                if (!text) {
                                    text = item;
                                }

                                return text;
                            });

                            _showRecommendations();
                        },
                        _getCustomOffSet = function() {
                            var settingOffset = _settings.offset,
                                result;

                            if (settingOffset) {
                                if (typeof settingOffset === 'function') {
                                    result = settingOffset();
                                } else {
                                    result = {
                                        left: settingOffset.left ? settingOffset.left : 0,
                                        top: settingOffset.top ? settingOffset.top : 0
                                    };
                                }
                            }

                            return result;
                        },
                        _showRecommendations = function() {
                            if (!recommendations || recommendations.length === 0) {
                                return;
                            }

                            if (!_selection.isVisible()) {
                                var pos = $this.offset(),
                                    offset = _getCustomOffSet();
                                if (offset) {
                                    pos.left += offset.left;
                                    pos.top += offset.top;
                                }

                                _selection.pos({
                                    left: pos.left + 'px',
                                    top: pos.top + 'px'
                                });
                                _selection.show();
                            }
                        },
                        _hideRecommendations = function() {
                            _selection.hide();
                        },
                        _selectionValueChanged = function(item, data) {
                            $this.val(data);
                        },
                        _initDOM = function() {
                            if (_selectionId) {
                                return;
                            }
                            acCount += 1;
                            _selectionId = 'pattaya-autocomplete-' + acCount;
                            var str = '<div id="' + _selectionId + '" style="display: none;"><ul></ul></div>';
                            $(str).css({
                                width: _settings.width ? _settings.width + 'px' : $this.outerWidth() + 'px',
                                height: _settings.height ? _settings.height + 'px' : 'auto'
                            }).appendTo($this.parent());
                        },
                        _initSelection = function() {
                            if (_selection) {
                                return;
                            }

                            var selectionOptions = {
                                loop: true,
                                valueChanged: _selectionValueChanged,
                                itemClicked: function(item, data) {
                                    if (_settings.itemClicked) {
                                        _settings.itemClicked(item, data);
                                    }
                                    $this[0].focus();
                                }
                            };

                            _selection = Pattaya.Global.UI.selection('#' + _selectionId, selectionOptions);
                        },
                        _keyDownEventHandler = function(e) {
                            if (!_enabled) {
                                return;
                            }

                            switch (e.keyCode) {
                            case KEYS.DOWN:
                                if (_selection.isVisible()) {
                                    _selection.next();
                                }

                                _showRecommendations();
                                break;
                            case KEYS.UP:
                                if (!_selection.isVisible()) {
                                    return;
                                }
                                _selection.prev();
                                e.preventDefault();
                                break;
                            case KEYS.RETURN:
                            case KEYS.ESC:
                            case KEYS.TAB:
                                _hideRecommendations();
                                //e.preventDefault();
                                break;
                            }
                        },
                        _keyUpEventHandler = function(e) {
                            if (!_enabled) {
                                return;
                            }

                            switch (e.keyCode) {
                            case KEYS.DOWN:
                            case KEYS.UP:
                            case KEYS.LEFT:
                            case KEYS.RIGHT:
                            case KEYS.RETURN:
                            case KEYS.ESC:
                            case KEYS.TAB:
                                break;
                            default:
                                if (_settings.valueChanged) {
                                    var keyword = $.trim($this.val());
                                    keywords.push(keyword.toLowerCase());
                                    _settings.valueChanged(keyword);
                                }
                                break;
                            }
                        },
                        _bindEvents = function() {
                            $this.on({
                                'keydown': _keyDownEventHandler,
                                'keyup': _keyUpEventHandler
                            });
                            $('html').on('click', _hideRecommendations);
                        },
                        _init = function() {
                            $this.attr("autocomplete", "off");
                            _initDOM();
                            _initSelection();
                            _bindEvents();
                            enable();
                        },
                        acInstance = {
                            unload: unload,
                            disable: disable,
                            enable: enable,

                            setRecommendations: setRecommendations
                        };

                    _init();

                    if (ac === undefined) {
                        ac = acInstance;
                    }

                    $this.data(DATA_KEY, {
                        autocomplete: acInstance
                    });
                });

                return ac;
            };

        autocomplete.__version = "20120114";
        $.extend(true, _ns, {
            autocomplete: autocomplete
        });
    }());

    /**
     * Pattaya.Global.UI.Menu
     */
    _ns.Menu || (function() {
        var _nsMenu = Pattaya.Global.ns("Menu", _ns);

        /**
         * Pattaya.Global.UI.Menu.toggle(seletor,settings)
         *
         *  Html:
		 *      <anyTag role="seletor">
		 *          <anyTag role="trigger" >text</anyTag>
		 *          <anyTag role="panel hidden">...</anyTag>
		 *      </anyTag>
         *
         *  mouseover: trigger addClass('hovered')
         */
        var toggle = function(selector, settings) {
			var settings = $.extend({
				intervalTrigger: 100,         // int:      triggler interval after onmouseover
				IntervalHide:    200,         // int:      hide interval after onmouseout
				posChanged:      true,        // bool:     move by window
				top:             0,           // int:      default top when posChanged is true
				wintop:          10,          // int:      window top when scroll bar showed
				before:          undefined,   // function: before opening
				after:           undefined    // function: after opening
			}, settings),
			
			DATA_MENU_INTERVAL_HIDE = "data-menu-interval-hide",
			DATA_MENU_DELAY = "data-menu-delay",
			DATA_MENU_INTERVAL_TRIGGER = "data-menu-interval-trigger",
			
			fnHide = $.noop,
			
			$sel = $(selector);
			
			$sel.each(function() {
				var that = $(this),
					triggerEle = that.children(":eq(0)"),
					offsetEle = that.children(":eq(1)");
				
				that.data(DATA_MENU_INTERVAL_HIDE, function() {
					triggerEle.removeClass("hovered")
					offsetEle.hide();
					
					that.removeData(DATA_MENU_DELAY);
					fnHide = $.noop;
				});
					
				that.off("mouseenter", "mouseleave").hover(function() {
					
					if(fnHide !== that.data(DATA_MENU_INTERVAL_HIDE)) {
						fnHide();
					}
					
					var delayTimout = that.data(DATA_MENU_DELAY);
					if (delayTimout) {
						clearTimeout(delayTimout);
						that.removeData(DATA_MENU_DELAY);
						
						return;
					}
					
					if (settings.posChanged) {
						var offsetParent = that.offsetParent(),
							offsetParentTop = offsetParent.offset().top,
							scrollTop = $(window).scrollTop(),
							offsetTop = that.position().top,
							eleTop = settings.top;

						if (scrollTop > offsetParentTop - settings.wintop) {
							eleTop = scrollTop - offsetParentTop + settings.wintop;
						}

						if (offsetTop + that.height() > offsetEle.height() + eleTop) {
							eleTop += (offsetTop + that.height() - offsetEle.height() - eleTop);
						}

						if (eleTop > offsetTop) {
							eleTop = offsetTop;
						}

						offsetEle.css('top', eleTop);
					}

					triggerEle.addClass("hovered");
					offsetEle.show();
					
				}, function() {
					var hide = that.data(DATA_MENU_INTERVAL_HIDE) || $.noop;
					
					if (settings.IntervalHide) {
						fnHide = hide;
						that.data(DATA_MENU_DELAY, setTimeout(hide, settings.IntervalHide));
					} else {
						hide();
					}
				});
			});
		};
        
		toggle.__version = "20120322";

        $.extend(true, _nsMenu, {
            toggle: toggle
        });
		
    })();
	
	/**
     * Pattaya.Global.UI.tmpl
     */
	_ns.tmpl || (function(){
		var bulidTmplFn = function(tmpl) {
				return new Function("obj",
						"var p=[];" +
						"with(obj){p.push('" +
						tmpl.replace(/[\r\t\n]/g, " ")
						   .split("<%").join("\t")
						   .replace(/((^|%>)[^\t]*)'/g, "$1\r")
						   .replace(/\t=(.*?)%>/g, "',$1,'")
						   .split("\t").join("');")
						   .split("%>").join("p.push('")
						   .split("\r").join("\\'") + 
						"');}return p.join('');"
						);
			},
			template = function(selector, data) {
				var $tmpl,
					tmpl,
					fn;
				
				if(selector instanceof $) {
					$tmpl = selector;
				} else if(typeof(selector) == "string") {
					$tmpl = $(selector);
				}
				
				tmpl = $tmpl.html();
				
				if(!$.isFunction($tmpl.data("tmpl"))) {
					$tmpl.data("tmpl", bulidTmplFn(tmpl));
				}
				
				fn = $tmpl.data("tmpl");
				
				return data ? fn(data) : fn;
			};
		
		template.__version = "20120827";
		
		$.extend(_ns, {
            tmpl: template
        });
	}());
	
    /**
     * Pattaya.Global.UI
     */
    $.extend(true, _ns, {
        inputFocus: function(selector, fns) {
            $(selector).each(function(i) {
                var that = $(this),
                    defaultVal = that.val();

                that.attr("autocomplete", "off").on({
                    focus: function() {
                        if ($.trim($(this).val()) == defaultVal) {
                            $(this).val('');
                        }
                    },
                    blur: function() {
                        if ($.trim($(this).val()).length == 0) {
                            $(this).val(defaultVal);
                        }
                    }
                });

                if (jQuery.isArray(fns)) {
                    if (typeof(fns[i]) == "function") {
                        that.keydown(function(e) {
                            if (e.keyCode == 13) {
                                fns[i].call(this);
                                e.preventDefault();
                            }
                        });
                    }
                } else if (typeof(fns) == "function") {
                    that.keydown(function(e) {
                        if (e.keyCode == 13) {
                            fns.call(this);
                            e.preventDefault();
                        }
                    });
                }
            });
        }
    });
}(this, Pattaya, jQuery));

/**
 * Pattaya.Global.Utils
 *
 * Required: jQuery
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("Utils", Pattaya.Global);
    $.extend(true, _ns, {
        "__version": "20111216",
        fixedEncodeURI: function(str) {
            return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
        },
        fixedEncodeURIComponent: function(str) {
            return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
        },
        format: function(str) {
            if (typeof str !== "string") {
                return str;
            }
            var l = arguments.length,
                i = 0,
                reg;

            if (l === 2 && $.type(arguments[1]) === 'object') {
                var repalceObj = arguments[1],
                    key;
                for (key in repalceObj) {
                    if (repalceObj.hasOwnProperty(key)) {
                        reg = new RegExp('\\{' + key + '\\}', 'g');
                        str = str.replace(reg, repalceObj[key]);
                    }
                }
            } else {
                for (; i < l - 1; i++) {
                    reg = new RegExp('\\{' + i + '\\}', 'g');
                    str = str.replace(reg, arguments[i + 1]);
                }

            }
            return str;
        },
        contains: function(source, target, funcCompare) {
            if (source == undefined || target == undefined) {
                return false;
            }
            if (funcCompare && $.type(funcCompare) !== 'function') {
                throw 'funcCompare must be a function.';
            }
            var tpSource = $.type(source);
            if (tpSource === 'string') {
                if (funcCompare != undefined) {
                    throw "customized funcCompare is not supported by string yet.";
                }
                return source.indexOf(target) !== -1;
            } else if (tpSource === 'array') {
                var found = false,
                    i = 0,
                    l = source.length;
                for (; i < l; i++) {
                    if (funcCompare) {
                        found = funcCompare(source[i], target);
                    } else {
                        found = (source[i] === target);
                    }
                    if (found === true) {
                        break;
                    }
                }
                return found;
            }
            throw tpSource + ' is not supported yet.';
        },
        firstOrUndefined: function(source, funCompare) {
            var result;
            if (source === undefined) {
                return result;
            }

            var tpSource = $.type(source);
            if (tpSource === 'array') {
                var i = 0,
                    l = source.length,
                    cur;

                if (l === 0) {
                    return result;
                }

                if (funCompare) {
                    for (; i < l; i++) {
                        cur = source[i];
                        if (funCompare(cur) === true) {
                            result = cur;
                            break;
                        }
                    }
                } else {
                    result = source[0];
                }
            } else {
                throw tpSource + ' is not supported yet.';
            }

            return result;
        },
        find: function(source, funCompare) {
            var result;
            if (source === undefined) {
                return result;
            }

            var tpSource = $.type(source);
            if (tpSource === 'array') {
                var i = 0,
                    l = source.length,
                    cur;

                if (funCompare) {
                    result = [];
                    for (; i < l; i++) {
                        cur = source[i];
                        if (funCompare(cur) === true) {
                            result.push(cur);
                        }
                    }
                } else {
                    result = source;
                }
            } else {
                throw tpSource + ' is not supported yet.';
            }

            return result;
        },
        cutString: function(str, len, endWith) {
            if (typeof(str) != "string") {
                return "";
            }

            if (len === 0 || $.isNumeric(len) && str.length <= len) {
                return str;
            }

            if (undefined !== endWith && typeof(endWith) == "string") {
                str = str.slice(0, len - endWith.length);
                return str.concat(endWith);
            } else {
                return str.slice(0, len);
            }
        }

    });
	
	/**
	 * html encode | html decode
	 */
	(function(){
		var htmlEntities = {
			'&amp;':'&',
			'&gt;':'>',
			'&lt;':'<',
			'&#x60;':'`',
			'&#x2F;':'/',
			'&quot;':'"',
			'&#x27;':"'"
		},
		reverseHtmlEntities = {},
		getEscapeReg,
		getUnEscapeReg;
		
		(function () {
			for (var p in htmlEntities) {
				if (htmlEntities.hasOwnProperty(p)) {
					reverseHtmlEntities[htmlEntities[p]] = p;
				}
			}
		})();
		
		getEscapeReg = function() {
			var str = "";
			
			$.each(htmlEntities, function (key, entity) {
				str += entity + '|';
			});
			
			str = str.slice(0, -1);
			
			return new RegExp(str, "g");
		};

		getUnEscapeReg = function() {
			var str = "";
			
			$.each(reverseHtmlEntities, function (key, entity) {
				str += entity + '|';
			});
			
			str += '&#(\\d{1,5});';
			
			return new RegExp(str, "g");
		};
		
		
		$.extend(true, _ns, {
			encodeHtml: function(str) {
				return str.replace(getEscapeReg(), function (m) {
                    return reverseHtmlEntities[m];
                });
			},
			decodeHtml: function(str) {
				return str.replace(getUnEscapeReg(), function (m, n) {
                    return htmlEntities[m] || String.fromCharCode(+n);
                });
			}
		});
	}());
	
	/**
	 * Pattaya.Global.Utils.urlParser
	 */
	_ns.urlParser || (function(){
		var urlParser = function(url) {
			var objUrl = {};
			
			var getFullUrl = function(oUrl) {
				var nUrl;
				
				if($.type(oUrl) !== "string" || !oUrl) {
					nUrl = window.location.href;
				} else if(/^(\w+:\/\/)/.test(oUrl)) {
					nUrl = oUrl;
				} else if(oUrl.indexOf('//') == 0) {
					nUrl = window.location.protocol + oUrl;
				} else if(oUrl.indexOf('/') == 0) {
					nUrl = window.location.protocol + '\/\/' + window.location.host + oUrl;
				} else if(oUrl.indexOf('../') == 0) {
					var pathname = window.location.pathname,
						dirLevel = oUrl.split('../').length -1;
					
					var arrDir = pathname.slice(0, pathname.lastIndexOf('/')).split('/'),
						length = arrDir.length;
					
					if(dirLevel >= length) {
						arrDir.length = 0;
					} else {
						arrDir.length = arrDir.length - dirLevel;
					}
					
					pathname = arrDir.join('/') + '/';
					
					nUrl = window.location.protocol + '\/\/' + window.location.host + pathname + oUrl.replace(/\.\.\//g, "");
				} else {
					nUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + oUrl;
				}
				
				
				
				return nUrl;
			};
			
			var nUrl = getFullUrl(url);
			var reg = /(\w+:)\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(\?[^#]*)?(#.*)?/i;
			var arr = nUrl.match(reg);
			
			objUrl["href"] = arr[0];
			objUrl["protocol"] = arr[1];
			objUrl["hostname"] = arr[2];
			objUrl["port"] = arr[3] ? arr[3].slice(1) : '80';
			objUrl["host"] = objUrl["hostname"] + (objUrl["port"] != '80' ? (':' + objUrl["port"]) : '');
			objUrl["pagename"] = arr[5] ? arr[5] : '';
			objUrl["pathname"] = (arr[4] ? arr[4] : '') + objUrl["pagename"];
			objUrl["search"] = arr[6] ? arr[6] : '';
			objUrl["hash"] = arr[7] ? arr[7] : '';
			
			var _unserialize = function(s) {
				var obj = {},
					arrParam = s.split('&'),
					arrPair,
					i;
				
				for( i = 0; i < arrParam.length; i++) {
					arrPair = arrParam[i].split('=');
					
					arrPair[0] && (obj[arrPair[0]] = arrPair[1]);
				}
				
				return obj;
			};
			
			var get = function(key) {
				return objUrl[key];
			};
			
			var set = function(key, value) {
				if(key) {
					objUrl[key] = value;
					
					objUrl["href"] = objUrl["protocol"] + '\/\/' + objUrl["host"] + objUrl["pathname"] + objUrl["search"] + objUrl["hash"];
				}
			};
			
			var getParam = function(key) {
				var params = objUrl["search"].slice(1);
				
				var oParams = _unserialize(params);
				
				if(key === undefined || key === '') {
					return oParams;
				}
				
				return oParams[key];
			};
			
			var setParam = function(key, value) {
				var params = objUrl["search"].slice(1);
				
				var oParams = _unserialize(params);
				
				key && (oParams[key] = value);
				
				set('search', '?' + $.param(oParams));
			};
			
			return {
				get: get,
				set: set,
				getParam: getParam,
				setParam: setParam
			};
		};
		
		$.extend(true, _ns, {
			urlParser: urlParser
		});
	}());
	
    /**
     * Pattaya.Global.Utils.DateTime
     */
    _ns.DateTime || (function() {
        var _this = function() {
                return Pattaya.Global.ns("DateTime", _ns);
            };
        var dateFormat = function() {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                    timezoneClip = /[^-+\dA-Z]/g,
                    pad = function(val, len) {
                        val = String(val);
                        len = len || 2;
                        while (val.length < len) {
                            val = "0" + val;
                        }
                        return val;
                    };
                // Regexes and supporting functions are cached through closure
                return function(date, mask, utc) {
                    var dF = dateFormat;
                    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }
                    // Passing date through Date applies Date.parse, if necessary
                    date = date ? new Date(date) : new Date();
                    if (isNaN(date)) {
                        throw new SyntaxError("invalid date");
                    }
                    mask = String(dF.masks[mask] || mask || dF.masks["default"]);
                    // Allow setting the utc argument via the mask
                    if (mask.slice(0, 4) == "UTC:") {
                        mask = mask.slice(4);
                        utc = true;
                    }
                    var _ = utc ? "getUTC" : "get",
                        d = date[_ + "Date"](),
                        D = date[_ + "Day"](),
                        m = date[_ + "Month"](),
                        y = date[_ + "FullYear"](),
                        H = date[_ + "Hours"](),
                        M = date[_ + "Minutes"](),
                        s = date[_ + "Seconds"](),
                        L = date[_ + "Milliseconds"](),
                        o = utc ? 0 : date.getTimezoneOffset(),
                        flags = {
                            d: d,
                            dd: pad(d),
                            ddd: dF.i18n.dayNames[D],
                            dddd: dF.i18n.dayNames[D + 7],
                            m: m + 1,
                            mm: pad(m + 1),
                            mmm: dF.i18n.monthNames[m],
                            mmmm: dF.i18n.monthNames[m + 12],
                            yy: String(y).slice(2),
                            yyyy: y,
                            h: H % 12 || 12,
                            hh: pad(H % 12 || 12),
                            H: H,
                            HH: pad(H),
                            M: M,
                            MM: pad(M),
                            s: s,
                            ss: pad(s),
                            l: pad(L, 3),
                            L: pad(L > 99 ? Math.round(L / 10) : L),
                            t: H < 12 ? "a" : "p",
                            tt: H < 12 ? "am" : "pm",
                            T: H < 12 ? "A" : "P",
                            TT: H < 12 ? "AM" : "PM",
                            Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                            o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                            S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                        };
                    return mask.replace(token, function($0) {
                        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                    });
                };
            }();
        // Some common format strings
        dateFormat.masks = {
            "default": "ddd mmm dd yyyy HH:MM:ss",
            shortDate: "m/d/yy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };
        // Internationalization strings
        dateFormat.i18n = {
            dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        };
        $.extend(true, _this(), {
            parseWCFDate: function(text) {
                var a = /^\/Date\((\d+)[\+|\-](\d{4})\)\/$/;
                if (typeof text === 'string') {
                    a = a.exec(text);
                    if (a) {
                        return new Date(parseInt(a[1], 10));
                    }
                }
                return null;
            },
            toWCFDate: function(d) {
                if (d instanceof Date) {
                    return '/Date(' + d.getTime() + '+0800)/';
                }
                return '';
            },
            parseNetDate: function(text) {
                var a = /^\/Date\((\d+)\)\/$/;
                if (typeof text === 'string') {
                    a = a.exec(text);
                    if (a) {
                        return new Date(parseInt(a[1], 10));
                    }
                }
                return null;
            },
            toNetDate: function(d) {
                if (d instanceof Date) {
                    return '/Date(' + d.getTime() + ')/';
                }
                return '';
            },
            dateFormat: dateFormat
        });
    }());
}(this, Pattaya, jQuery));

/**
 * Pattaya.Global.Thread
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var _ns = Pattaya.Global.ns("Thread", Pattaya.Global);
    $.extend(true, _ns, {
        sleep: function(ms) {
            var date = new Date(),
                curDate = null;
            do {
                curDate = new Date();
            } while (curDate - date < ms);
        }
    });
}(this, Pattaya, jQuery));

/**
 *   Pattaya.Global.Validation
 */
(function(window, Pattaya, $, undefined) {
    "use strict";
    var validation = {
        __version: "20111111",
        isEmail: function(email) {
            return (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/i).test(email);
        },
        digits: function(value) {
            return /^\d+$/.test(value);
        },
		url: function (value, element) {
			return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		}
    };
    $.extend(true, Pattaya.Global, {
        "Validation": validation
    });
}(this, Pattaya, jQuery));

/**
 * Pattaya.Global.Page
 */
(function(window, Pattaya, $) {
    "use strict";
    var _ns = Pattaya.Global.ns("Page", Pattaya.Global);

    /**
     *   Pattaya.Global.Page.Config
     */
    var config = {
        URL_SEARCH: 'http://s.dx.com/search/',
        URL_NEWSLETTER: 'http://www.dx.com/newsletters?e=',
		URL_OFFERS: '//dx.com/CommonContent/GetOffersProducts/',
        DX_GLOBAL_COOKIES: {
            key: "DXGlobalization",
            domain: ".dx.com",
            expiresDays: 365
        }
    };
    $.extend(_ns, {
        Config: config
    });

    /**
     *   Pattaya.Global.Page.Header
     *   @Return: {
     *      init: function
     *        set: function
     *          using：Pattaya.Global.Page.Header.set({_regionChanged: function($li){}, _currencyChanged: function($li){}, _langChanged: function($li){}})
     *   }
     */
    var header = (function() {
        //version
        var _version = "20111230",

            _dxPortalRootUrl = "//www.dx.com",

            LIVE_CHAT_HTML = '<span id="lpButDivID-1323762109" class="livechat"></span><script type="text/javascript" charset="UTF-8" src="https://server.iad.liveperson.net/hc/36938864/?cmd=mTagRepstate&site=36938864&buttonID=7&divID=lpButDivID-1323762109&bt=3&c=1"></script>',

            setDXGlobalCookies = function(key, name, value) {
                //get global cookie
                var globalCookie = $.cookie(key);
                var arrGlobalCookie = [];
                if (globalCookie != null) {
                    arrGlobalCookie = globalCookie.split("&");
                }
                //set cookie
                var isSeted = false;
                $.each(arrGlobalCookie, function(i, v) {
                    if (v.indexOf(name + '=') == 0) {
                        arrGlobalCookie[i] = name + '=' + value;
                        isSeted = true;

                        return false;
                    }
                });

                if (!isSeted) {
                    arrGlobalCookie.push(name + '=' + value);
                }
                globalCookie = arrGlobalCookie.join('&');

                $.cookie(key, globalCookie, {
                    expires: config.DX_GLOBAL_COOKIES.expiresDays,
                    domain: config.DX_GLOBAL_COOKIES.domain,
                    path:'/'
                });
            },

            changeCurrency = function(code){
                if($.trim(code) != ""){
                    setDXGlobalCookies(config.DX_GLOBAL_COOKIES.key, "currency", code);
                    window.location.href = window.location.href;
                }
            },

            changeLang = function(code){
                if($.trim(code) != ""){
                    setDXGlobalCookies(config.DX_GLOBAL_COOKIES.key, "lang", code);
                    window.location.href = window.location.href;
                }
            },

            //region click event
            _regionChanged = function(ele) {
                var val = ele.attr("key");
                setDXGlobalCookies(config.DX_GLOBAL_COOKIES.key, "region", val);
                window.location.href = window.location.href;
            },

            //currency click event
            _currencyChanged = function(ele) {
                var val = ele.attr("key");
                changeCurrency(val);
            },
            
			//language click event
            _langChanged = function(ele) {
                var val = ele.attr("key");
                changeLang(val);
            },

            _loadCustomizedInfo = function() {
                var url = _dxPortalRootUrl + '/CommonContent/TopBar?jsoncallback=?';
                $.ajax({
                    url: url,
                    dataType: 'json'
                }).done(function(data) {
                    if (!data || !data.success) {
                        return;
                    }

                    var countryCode = data.countryCode,
                        countryMsg = data.countryMsg,

                        currencyList = data.currencyList,
                        currentCurrency = data.currentCurrency,

                        customer = data.customer,
                        logoutLink = data.logoutLink,
                        topBar = $(".topbar"),
                        myAccountUrl = topBar.find(".login_bar > li:nth-child(2) > a").attr('href'),
                        format = Pattaya.Global.Utils.format;

                    if (countryCode !== '') {
                        topBar.find(".choose_country .flag").removeClass('flag-global').addClass('flag-' + data.countryCode).html('<b></b>' + countryMsg);
                    }

                    if (customer) {
                        topBar.find(".login_bar > li:first").html(format('Hi,&nbsp;<a href="{myAccountUrl}" target="_blank">{displayName}<a>&nbsp;[{logoutLink}]', {
                            myAccountUrl: myAccountUrl,
                            displayName: customer.Status ? customer.UserName : customer.Email,
                            logoutLink: logoutLink
                        }));
                    }

                    if(currentCurrency){
                        topBar.find(".currencyMenu > a:first").html(format('<span class="currency_icon {val}">{text}</span>',{
                            val:currentCurrency.Value,
                            text:currentCurrency.Entity
                        }));
                    }

                    if(currencyList){
                       
                        var lihtml = "";
                        $.each(currencyList, function(i,n){
                            lihtml += format('<li key="{val}"><span class="currency_icon {val}">{text}</span></li>',
                            {
                              val:n.Value, 
                              text:n.Text
                            });
                        });
                        topBar.find(".currency > ul:first").html(lihtml);

                        //show current currency 
                        topBar.find(".currencyMenu > a:first").show();

                        Pattaya.Global.UI.dropdown(".currencyMenu", {
                            type: 'menu',
                            onChanged:_currencyChanged
                        });
                    }
                });
            },

            _loadLiveChat = function() {
                var liveChatLi = $(".login_bar > li:last > div > ul > li:last");
                liveChatLi.html('');
                $(function() {
                    liveChatLi.html(LIVE_CHAT_HTML);
                });
            },

            _encodeURI = function(unzipStr) {
                var zipstr, strSpecial, tt,

                filterKeword = function(keyword) {
                        var value;
                        while (true) {
                            value = keyword.replace(/[\?:"*<>\\\/|%]|^(\.+)|(\.+)$/g, " ");
                            value = value.replace(/(^\s*)|(\s*$)/g, "");
                            if (value == keyword) {
                                break;
                            } else {
                                keyword = value;
                            }
                        }
                        return value;
                    },

                    stringToAscii = function(str) {
                        return str.charCodeAt(0).toString(16);
                    };

                unzipStr = filterKeword(unzipStr);
                zipstr = "";
                strSpecial = "!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
                tt = "";

                for (var i = 0; i < unzipStr.length; i++) {
                    var chr = unzipStr.charAt(i);
                    var c = stringToAscii(chr);
                    tt += chr + ":" + c + "n";
                    if (parseInt("0x" + c) > 0x7f) {
                        zipstr += encodeURI(unzipStr.substr(i, 1));
                    } else {
                        if (chr == " ") zipstr += "+";
                        else if (strSpecial.indexOf(chr) != -1) zipstr += "%" + c.toString(16);
                        else zipstr += chr;
                    }
                }
                return zipstr;
            },

            _loadSearch = function() {
                //search
                var defaultSeaVal = $.trim($("#txtKeyword").val()),
                    $btnSearch = $("#btnSearch"),
                    $txtKeyword = $("#txtKeyword"),
                    searchSiteRootUrl = config.URL_SEARCH,
                    doubleSlashIndex = searchSiteRootUrl.indexOf('//'),
                    pathSlashIndex, triggerSearch = function() {
                        $btnSearch.click();
                    };

                if (doubleSlashIndex >= 0) {
                    searchSiteRootUrl = searchSiteRootUrl.substring(doubleSlashIndex + 2);
                }
                pathSlashIndex = searchSiteRootUrl.indexOf('/');
                if (pathSlashIndex > 0) {
                    searchSiteRootUrl = searchSiteRootUrl.substr(0, pathSlashIndex);
                }

                $btnSearch.on({
                    'click': function() {
                        var key = $.trim($txtKeyword.val());

                        if (key === defaultSeaVal || key.length == 0) {
                            $txtKeyword.val(defaultSeaVal);
                            $txtKeyword.focus();
                        } else {
                            key = _encodeURI(key);
                            window.location.href = 'http://' + searchSiteRootUrl + '/search/' + key;
                        }
                    }
                });

                Pattaya.Global.UI.inputFocus("#txtKeyword", triggerSearch);
                $txtKeyword.on({
                    'focus': function() {
                        $(this).addClass('txt_key_focus');
                    },
                    'blur': function() {
                        if (defaultSeaVal === $(this).val()) {
                            $(this).removeClass('txt_key_focus');
                        }
                    }
                });

                var fetchingRecommendations = false,
                    cache = {},
                    ac = Pattaya.Global.UI.autocomplete('#txtKeyword', {
                        width: 288,
                        offset: function() {
                            var txtOffset = $txtKeyword.offset();
                            return {
                                left: -1 * txtOffset.left + 16,
                                top: -1 * txtOffset.top + 32
                            };
                        },
                        itemClicked: triggerSearch,
                        valueChanged: function(v) {
                            if (fetchingRecommendations || v === defaultSeaVal || v.length < 2) {
                                ac.setRecommendations([]);
                                return;
                            }

                            if (cache.hasOwnProperty(v)) {
                                ac.setRecommendations(cache[v]);
                                return;
                            }

                            var format = Pattaya.Global.Utils.format,
                                url = format('//{searchRootUrl}/ajax/relatedkeywords.ashx?keyword={keyword}&jsoncallback=?', {
                                    "searchRootUrl": searchSiteRootUrl,
                                    "keyword": _encodeURI(v)
                                });

                            fetchingRecommendations = true;
                            $.ajax({
                                url: url,
                                dataType: 'json'
                            }).done(function(data) {
                                var recommendations = [];
                                if (data && data.keywords) {
                                    recommendations = data.keywords;
                                }
                                cache[v] = recommendations;
                                ac.setRecommendations(recommendations);
                            }).fail(function() {
                                ac.setRecommendations([]);
                            }).always(function() {
                                fetchingRecommendations = false;
                            });
                        }
                    });
            },
			
			_initOffers = function() {
				var panel = '<div class="deals_popup"><ul class="deals_pro_list clearfix"></ul><span class="arrowhead_t"></span></div>',
					$deals = $(".nav > .nav_r").children(":eq(2)"),
					url = Pattaya.Global.Page.Config.URL_OFFERS,
					DATA_OFFERS_INTERVAL_TRIGGER = "data-offers-internal-trigger";
				
				var initFail = function($panel){
					var $failPanel = $('<li class="fail">load failed, you can click <b>hear</b> to retry</li>');
					
					$panel.removeClass("showloader");
					$failPanel.find("b").click(function(){
						loadOffers($panel);
					});
					
					$panel.find(".deals_pro_list").html($failPanel);
				},
				
				loadOffers = function($panel) {
					var $ulPanel = $panel.find(".deals_pro_list");
					
					$panel.addClass("showloader");
					$ulPanel.empty();
					
					$.ajax({
						url: url + "?jsoncallback=?",
						dataType: 'json'
					}).done(function(data){
						var liPanel = '<li><a class="deals_pro" href="_link_" target="_blank"><div class="pb"><img class="pic" src="_imgSrc_" /></div><div class="bottom"><p class="deals_pro_pri"><b class="blp"><span class="price">_price_</span></b><b class="discount"><span class="per">_discount_</span>OFF</b></p><p class="title">_title_</p></div></a></li>'
						
						$panel.removeClass("showloader");
						if(data && data.success) {
							$.each(data.products, function(i, pro){
								var li = liPanel.replace('_link_', pro.ProductUrl)
													.replace('_imgSrc_', pro.ImageUrl)
													.replace('_price_', pro.PriceInfo)
													.replace('_discount_', pro.DiscountInfo)
													.replace('_title_', pro.Title);
													
								$ulPanel.append(li);
							});
						} else {
							initFail($panel)
						}
					}).fail(function(){
						initFail($panel);
					});
				};
				
				$deals.hover(function(){
					$(this).data(DATA_OFFERS_INTERVAL_TRIGGER, setTimeout(function(){
						var $panel = $deals.children(".deals_popup");
					
						if($panel.length) {
							$panel.show();
						} else {
							$deals.append(panel);
							$panel = $deals.children(".deals_popup");
							
							loadOffers($panel);
						}
					}, 200));
				},function(){
					var triggerTimeout = $(this).data(DATA_OFFERS_INTERVAL_TRIGGER);
					
					if(triggerTimeout) {
						clearTimeout(triggerTimeout);
					} 
					
					$deals.children(".deals_popup").hide();
				});
			}
			
        return {
            __version: _version,
            init: function(dxPortalRootUrl) {
                if (dxPortalRootUrl && (typeof dxPortalRootUrl === 'string')) {
                    _dxPortalRootUrl = dxPortalRootUrl;
                }

                setTimeout(_loadCustomizedInfo, 3000);
                
                Pattaya.Global.UI.dropdown(".slideBox", {type: 'menu'});
                _loadLiveChat();

                //region, language, currency click handling
                /*
                $("#regionList > li,#currencyList > li,#langList > li").click(function() {
                    var iden = $(this).parent().attr("id");

                    switch (iden) {
                    case "regionList":
                        _regionChanged($(this));
                        break;
                    
                    case "langList":
                        _langChanged($(this));
                        break;
                    }
                });*/

                _loadSearch();
				
				_initOffers();
                // subpage menu
                Pattaya.Global.UI.Menu.toggle("#categoryBox", {
                    posChanged: false
                });
                Pattaya.Global.UI.Menu.toggle("#categoryPanel li");
            },
            set: function(settings) {
                if (settings.regionChanged && $.isFunction(settings.regionChanged)) {
                    _regionChanged = settings.regionChanged;
                }
                if (settings.currencyChanged && $.isFunction(settings.currencyChanged)) {
                    _currencyChanged = settings.currencyChanged;
                }
                if (settings.langChanged && $.isFunction(settings.langChanged)) {
                    _langChanged = settings.langChanged;
                }
            },
            setSearchKeyword: function(keyword) {
                if (!keyword || keyword === '') {
                    return;
                }
                var $txtKeyword = $("#txtKeyword");
                $txtKeyword.val(keyword).addClass('txt_key_focus');
            }
        }
    })();
    $.extend(true, _ns, {
        Header: header
    });

    /**
     *   Pattaya.Global.Page.Footer
     *   @Return: {
     *       init: function.
     *  }
     */
    var footer = (function() {
        var _version = "20111221";

        var _newsLetter = function() {
                var defaultNLVal = $.trim($(".txtNewsLetter").val()),
                    $Input = $(".txtNewsLetter"),
                    $btn = $(".btnNewsletter"),
                    $error = $(".newletter_error");

                $btn.click(function() {
                    var key = $.trim($Input.val());

                    if (key === defaultNLVal || key.length == 0) {
                        $Input.focus();
                    } else if (!Pattaya.Global.Validation.isEmail(key)) {
                        $Input.focus();
                        $error.show();
                    } else {
                        $error.hide();
                        window.location.href = config.URL_NEWSLETTER + key;
                    }
                });
                $Input.blur(function() {
                    var key = $.trim($Input.val());
                    if (key === defaultNLVal || key.length == 0 || Pattaya.Global.Validation.isEmail(key)) {
                        $error.hide();
                    } else {
                        $error.show();
                    }
                });
                Pattaya.Global.UI.inputFocus(".txtNewsLetter", function() {
                    $btn.click();
                });
            }

        return {
            __version: _version,
            init: function() {
                _newsLetter();

            }
        };
    })();
    $.extend(true, _ns, {
        Footer: footer
    });

})(this, Pattaya, jQuery);