(function (window, $, Pattaya) {
	
	var __version = "20121213",
		_ns = Pattaya.Global.ns("LoginOrSignUp", Pattaya),
		_config = {
			'passportRootUrl': 'https://passport.dx.com'
		},
		_settings,
		SUBMIT_PATH = "/ajax/login_register.aspx?type={0}",
		CHECK_PATH = "/ajax/Common.ashx?action={0}&callback=?",
		_active = 0;

	//登陆窗用于购物车时增加cart类
    var HTML_LAYOUT = '<div class="login_register_dialog {guest}"><div class="wrap">' + 
				         '<ul class="login_register_tab clearfix">' + 
					         '<li class="b_r"><a href="#dx-login" class="item ">Sign In</a></li>' + 
						     '<li><a href="#dx-register" class="item">Register</a></li>' + 
					      '</ul>' + 
					      '<div id="dx-login" class="login_register_con">' +
							  '<form id="dx-login-form" action="{loginUrl}" method="post" target="lr-iframe">' + 
								  '<p class="row">' + 
									  '<label class="col_l" for="dx-l-email"><i class="ico_email"></i> Email/Username</label>' + 
									  '<span class="col_r"><span class="input_box"><input class="text" id="dx-l-email" name="dx-l-email"/><i class="ico_s"></i></span></span>' + 
								  '</p>' + 
								  '<p class="row">' + 
									  '<label class="col_l" for="dx-l-password"><i class="ico_pwd"></i>Password</label>' + 
									  '<span class="col_r"><span class="input_box"><input id="dx-l-password" name= "dx-l-password" class="text" type="password" /><i class="ico_s"></i></span></span>' +
								  '</p>' +
								  '<p class="row_op">' + 
									  '<span class="col_r clearfix">' + 
									  		'<a class="link_f" href="{passwordReminderUrl}" target="_blank">Forgot Password</a>' +
									  		'<button class="pbtn" id="dx-login-submit" >Sign In</button>' +
									  	'</span>' +
								  '</p>' + 
								  '<div class="row_msg">' + 
									  '<div id="login-error" class="login_infobox">' + 
									  		'<i></i>' +
									  		'<span class="info"></span>' +
									  '</div>' +
								  '</div>' + 
							  '</form>' +
						  '</div>' + 
					      '<div id="dx-register" class="login_register_con reg_con">' +
							  '<form id="dx-register-form" action="{registerUrl}" method="post" target="lr-iframe">' + 
								  '<div id="register-error" class="error-panel hidden"></div>' +
								  '<p class="row">' + 
									  '<label class="col_l" for="dx-r-email"> *Email:</label>' + 
									  '<span class="col_r"><span class="input_box"><input class="text" id="dx-r-email" name="dx-r-email" /><i class="ico_s"></i></span></span>' + 
								  '</p>' + 
								  '<p class="row">' + 
									  '<label class="col_l" for="dx-r-forumNickname">*Forum Nickname:</label>' + 
									  '<span class="col_r"><span class="input_box"><input class="text" id="dx-r-forumNickname" name="dx-r-forumNickname" /><i class="ico_s"></i></span></span>' +
								  '</p>' + 
								  '<p class="row name">' + 
									  '<label class="col_l" for="dx-r-firstName">*Name:</label>' +
									  '<span class="col_r clearfix"><span class="input_box firstname"><input class="text" id="dx-r-firstName" name="dx-r-firstName" placeholder="First Name"/><i class="ico_s"></i></span><span class="input_box lastname"><input class="text" id="dx-r-lastName" name="dx-r-lastName"   placeholder="Last Name"/><i class="ico_s"></i></span></span>' +
								  '</p>' +
								  '<p class="row">' +
									  '<label class="col_l" for="dx-r-password">*Password:</label>' + 
									  '<span class="col_r"><span class="input_box"><input class="text" id="dx-r-password" name="dx-r-password" type="password" autocomplete="off" /><i class="ico_s"></i></span></span>' +
								  '</p>' +
								  '<p class="row">' +
									  '<label class="col_l" for="dx-r-cPassword">*Confirm Password:</label>' +
									  '<span class="col_r"><span class="input_box"><input class="text" id="dx-r-cPassword"  name="dx-r-cPassword" type="password" autocomplete="off" /><i class="ico_s"></i></span></span>' +
								  '</p>' + 
								  // '<p class="row_cb">' + 
									 //  '<span class="col_l"></span>' + 
									 //  '<span class="col_r"><label class="lbl_subscribe" for="dx-r-cbSubscribe"><input id="dx-r-cbSubscribe"  name="dx-r-cbSubscribe" class="checkbox" type="checkbox" /> Subscribe to get Discounts & Big Prizes.</label></span>' +
								  // '</p>' + 
								  '<p class="row_op">' + 
									  '<button class="rbtn" id="dx-register-submit">Create Account</button>' + 
								  '</p>' + 
								  '<div class="row_msg">' + 
									  '<div id="register-error" class="login_infobox">' + 
									  		'<i></i>' +
									  		'<span class="info"></span>' +
									  '</div>' +
								  '</div>' + 
								  '<p class="row_info"> DX dones not exchange or trade your information. Your privacy is guaranteed.</p>' + 								 
							  '</form>' +
						  '</div>' + 
						  '{checkout}' +
					      '{btnClose}' + 
						  '<iframe name="lr-iframe" id="lr-iframe" src="javascript:;" style="display:none;"></iframe>' +
				     '</div></div></div>',
		HTML_BUTTON_CLOSE = '<a href="#close" class="close" data-dialog-role="close">close</a>',
		HTML_CHECKOUT = '<div class="login_guest_con"><a href="#" class="btn_checkout_guest">Checkout As Guest</a></div>';
		HTML_REGISTER_SUCCESS = '<div class="reg_return"><div class="reg_return_wrap">' +
									'<h1 class="tit">Account Created Successful，Please Activate it!</h1>' +
									'<p class="con">An activation email have be sent to you.<br>Please follow the prompts to activate your account.</p>' +
									'<p class="link_con"><a href="#">Resend Activation Email &gt;&gt;</a></p>' +
								'</div>';

    function _bind() {
		//tab
		Pattaya.Global.UI.tabs(".login_register_tab", {
			active: _active
		});
		
        //validation
        var bindValidation = function () {
            var format = Pattaya.Global.Utils.format;
			
			var render = function (ele, msg, type) {
                var parent = ele.parent();

                if (type == "error") {
                    parent.removeClass("v_success").addClass("v_error");
                } else if (type == "success") {
                    parent.removeClass("v_error").addClass("v_success");
                }

                var infobox = parent.find(".infobox");
                if (infobox.length == 0) {
                    parent.append('<span class="infobox"><span class="info">' + msg + '</span></span>');
                } else {
                    infobox
						.find(".info").text(msg)
					.end().show();
                }
            },
			renderError = function (ele, msg) {
				render(ele, msg, "error");
			},
			renderSuccess = function (ele) {
				render(ele, '', "success");
			},
			clear = function(ele, type) {
				var parent = ele.parent(),
					infobox = parent.find(".infobox");
				
				if (type == "error") {
					if(parent.hasClass("v_error")) {
						parent.removeClass("v_error");
						infobox.hide();
					}
				} else if (type == "success") {
					if(parent.hasClass("v_success")) {
						parent.removeClass("v_success");
						infobox.hide();
					}
                }
			},
			clearError = function(ele) {
				clear(ele, "error");
			};

            var validMessages = {
                required: "The is required.",
                email: "Please enter a valid email address.",
                maxlength: "Please enter no more than {0} characters.",
                equalTo: "Please enter the same value again.",
                wordnum: "Please enter a correct format."
            },

			validMethods = {
				required: function (val) {

					if (val.length > 0) {

						return true;
					}

					return false;
				},
				email: function (val) {

					if (Pattaya.Global.Validation.email(val)) {

						return true;
					}

					return false;

				},
				maxlength: function (val, max) {

					if (val.length <= max) {

						return true;
					}

					return false;
				},
				equalTo: function (val, selector) {

					return val == $(selector).val();
				},
				wordnum: function (val) {
					return /^[a-z0-9]*$/i.test(val);
				},
				remote: function(val, opts, calls) {
					$.ajax({
						url: opts.url,
						dataType: 'json',
						data: {'val': val}
					}).done(function(data) {
						if (data) {
							if(data.state === "1") {
								calls.success();
							} else if(data.state === "0" || data.state === "-1") {
								calls.error(data.msg);
							}
						}
					});
				}
			},

			validator = function (submitCallbacked) {
				var ele = $(this),
					val = $.trim(ele.val()),
					msg,
					result = true;

				var field,
					rule,
					hasRemote;
					
					
				for (filed in validMethods) {

					rule = ele.data(filed);
					
					if (rule) {
						if(filed == "remote") {
							hasRemote = true;
							
							continue;
						}
						
						result = validMethods[filed](val, rule);
						
						if (!result) {

							msg = format(validMessages[filed], rule);

							renderError(ele, msg);

							return result;
						}
					}
				}
				
				if(hasRemote) {
					if(submitCallbacked) {
						return !(ele.data("remote-result") === false);
					} else {
						clearError(ele);
						
						validMethods["remote"](val, ele.data(filed), {
							error: function(msg) {
								ele.data("remote-result", false);
								renderError(ele, msg);
							},
							success: function() {
								ele.data("remote-result", true);
								renderSuccess(ele);
							}
						});
						
						return "pending";
					}
				}
				
				renderSuccess(ele);
				
				return result;
			},

			addValidRules = function (opt) {

				var ele,
					selector,
					rules;

				for (selector in opt) {

					ele = $(selector);
					rules = opt[selector];

					var rule;
					for (rule in rules) {
						ele.data(rule, rules[rule]);
					}
				}
			};

            var loginValidation = function () {

                var loginForm = $("#dx-login-form");

                addValidRules({
                    "#dx-l-email": {
                     	"required": true,
                     	"maxlength": 50
                    },
                    "#dx-l-password": {
                        "required": true,
                        "maxlength": 20
                    }
                });

                $(":text, :password", loginForm).data("validator", validator).on("blur", function () {

                    var ele = $(this);

                    if (!ele.data("blured")) {

                        ele.data("blured", true).on("keyup", validator);
                    }

                    ele.data("validator").call(this);
                });

                $("#dx-login-submit").data("valid", function () {
                    var btnSubmit = $(this),
						result = true;

                    $(":text, :password", loginForm).each(function () {

                        var input = $(this),
							validator = input.data("validator");

                        if ($.isFunction(validator)) {
                            if (!validator.call(input[0], true)) {

                                result = false;
                            }
                        }
                    });

                    return result;
                });
            },

			registerValidation = function () {
				var registerForm = $("#dx-register-form");

				addValidRules({
					"#dx-r-email": {
						"required": true,
						"maxlength": 50,
						"remote": {
							url: format(_config.passportRootUrl + CHECK_PATH, "CheckAccountEmail")
						}
					},
					"#dx-r-forumNickname": {
						"required": true,
						"maxlength": 15,
						"wordnum": true,
						"remote": {
							url: format(_config.passportRootUrl + CHECK_PATH, "CheckAccountUsername")
						}
					},
					"#dx-r-firstName, #dx-r-lastName": {
						"required": true,
						"maxlength": 50
					},
					"#dx-r-password": {
						"required": true,
						"maxlength": 20
					},
					"#dx-r-cPassword": {
						"required": true,
						"maxlength": 20,
						"equalTo": "#dx-r-password"
					}
				});

				$(":text, :password", registerForm).data("validator", validator).on("blur", function () {

					var ele = $(this);

					if (!ele.data("blured")) {

						ele.data("blured", true).on("keyup", validator);
					}

					ele.data("validator").call(this);


				});

				$("#dx-register-submit").data("valid", function () {

					var btnSubmit = $(this),
						result = true;

					$(":text, :password", registerForm).each(function () {

						var input = $(this),
							validator = input.data("validator");

						if ($.isFunction(validator)) {

							if (!validator.call(input[0], true)) {

								result = false;
							}
						}
					});

					return result;
				});
			};

            var initValidation = function () {
                loginValidation();
                registerValidation();
            };

            initValidation();
        };

        bindValidation();
		
		//submiting
		$("#dx-login-submit, #dx-register-submit").click(function(){
			var btn = $(this);
			
			if(!btn.data("valid")()) {
				return false;
			}
			
			if(btn.data("disable") == "disable") {
				return false;
			} else {
				btn.data("disable", "disable");
			}
			
			btn.text("Loading...").addClass("disable").data("disable", "disable");
		});
    }

    function _open(settings) {
		//temp
		if(settings && !settings.closeDirect) {
			Pattaya.Global.Utils.goPageWithCurrentUrl(_config.passportRootUrl + "/accounts/default.dx?redirect=");
			return;
		}
		
		document.domain = "dx.com";
		
		//if the dialog has opened, do nothing
		if($("#dx-login").length > 0) {
			return;
		}
		
		//default settings
		_settings = {
			'showClose': true, //showing close button?
			'success': $.noop,
			'error': $.noop,
			'showGuest': false
		};
		
    	settings = $.extend(_settings, settings);
		
		var format = Pattaya.Global.Utils.format,
		
			loginUrl = format(_config.passportRootUrl + SUBMIT_PATH, "login"),
			registerUrl = format(_config.passportRootUrl + SUBMIT_PATH, "register"),
			htmlBtnClose = settings.showClose ? HTML_BUTTON_CLOSE : "",
			htmlCheckout = settings.showGuest ? HTML_CHECKOUT: "",
			guest = settings.showGuest ? "guest" : "",
			passwordReminderUrl = _config.passportRootUrl + "/accounts/passwordreminder.dx";
		
		var html = format(HTML_LAYOUT, {
					'loginUrl': loginUrl,
					'registerUrl': registerUrl,
					'btnClose': htmlBtnClose,
					'passwordReminderUrl': passwordReminderUrl,
					'guest': guest,
					'checkout': htmlCheckout
				});
		
		Pattaya.Global.UI.dialog(html, { 
			usePanel: false,
			overlayClose: false,
			top: "15%"
		});
		
		_bind();
	}
	
    var set = function(config) {
		$.extend(_config, config);
	},
	
	login = function (settings) {
        active = 0;
        
		_open(settings);
    },
	
	register = function(settings) {
		active = 1;
        
		_open(settings);
	},
	
	//parent page callback
	callback = function(data) {
		if(!data) {
			return;
		}
		
		var reset = function(type) {
			if(type == "login") {
				$("#dx-login-submit").text("Sign In").removeClass("disable").removeData("disable");
			} else if(type == "register") {
				$("#dx-register-submit").text("Create Account").removeClass("disable").removeData("disable");
			}
		},
		hideError = function(type) {
			if(type == "login") {
				$("#login-error").hide();
			} else if(type == "register") {
				$("#register-error").hide();
			}
		};
		
		if(data.success) {
			if($.isFunction(_settings.success)) {
				if(_settings.success() === false) {
					reset(data.type);
					hideError(data.type);
					return;
				}
			}
			
			window.location.href = data.redirectUrl ? data.redirectUrl : window.location.href;
		} else {
			if(data.type == "login") {
				if(data.msg) {
					$("#login-error").addClass("error").find(".info").text(data.msg);
				}
			} else if(data.type == "register") {
				if(data.msg) {
					$("#register-error").addClass("error").find(".info").text(data.msg);
				}
			}
			
			if($.isFunction(_settings.error)) {
				_settings.error();
			}
			
			reset(data.type);
		}
	};
	
	$.extend(_ns, {
        __version: __version,
		set: set,
        login: login,
        register: register,
		callback: callback
	});

})(window, jQuery, Pattaya);