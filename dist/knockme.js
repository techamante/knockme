var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("Mediator", ["require", "exports"], function (require, exports) {
    "use strict";
    var Mediator = (function () {
        function Mediator() {
        }
        Mediator.Publish = function (message) {
            amplify.publish(message.Topic, message.Data);
        };
        Mediator.Subscribe = function (messageType, callback) {
            var message = new messageType();
            amplify.subscribe(message.Topic, callback);
            return {
                MessageType: messageType,
                CallBack: callback
            };
        };
        Mediator.Unsubscribe = function (subscription) {
            var message = new subscription.MessageType();
            amplify.unsubscribe(message.Topic, subscription.CallBack);
        };
        return Mediator;
    }());
    exports.Mediator = Mediator;
    var BaseMessage = (function () {
        function BaseMessage() {
        }
        BaseMessage.Create = function (obj, messageType) {
            if (messageType === void 0) { messageType = BaseMessage; }
            var message = new messageType();
            return _.extend(message, obj);
        };
        return BaseMessage;
    }());
    exports.BaseMessage = BaseMessage;
});
define("ViewModel", ["require", "exports", "Router"], function (require, exports, Router_1) {
    "use strict";
    var ViewModelBase = (function () {
        function ViewModelBase(appContext, params) {
            this.AppContext = appContext;
        }
        ViewModelBase.prototype.Publish = function (message) {
            if (this.ParentViewModel != null) {
                if (this.ParentViewModel.Subscribe) {
                    if (!this.ParentViewModel.Subscribe(message)) {
                        this.ParentViewModel.Publish(message);
                    }
                }
                else {
                    this.ParentViewModel.Publish(message);
                }
            }
        };
        return ViewModelBase;
    }());
    exports.ViewModelBase = ViewModelBase;
    var PageViewModelBase = (function (_super) {
        __extends(PageViewModelBase, _super);
        function PageViewModelBase(appContext, params) {
            _super.call(this, appContext, params);
            this.PageViewModel = ko.observable();
            this.SideViews = ko.observableArray();
        }
        return PageViewModelBase;
    }(ViewModelBase));
    exports.PageViewModelBase = PageViewModelBase;
    var PageViewModelLoader = (function () {
        function PageViewModelLoader(root, appContext) {
            this.root = root;
            this.appContext = appContext;
        }
        PageViewModelLoader.prototype.Load = function (route, params) {
            var states = this.ConstructStateHierarchy(route.State);
            this.RenderState(states, this.root, null, route, params);
        };
        PageViewModelLoader.prototype.RenderState = function (states, pageViewModel, parentPageViewModel, route, params) {
            if (states.length == 0)
                return;
            var parent = pageViewModel;
            var state = states.shift();
            var vm = this.FindPageViewModel(state);
            if (!vm) {
                vm = this.CreatePageViewModel(state, route, params);
                vm.ParentViewModel = parent;
                parent.PageViewModel(vm);
            }
            else {
                if (vm.OnParamsChange) {
                    vm.OnParamsChange(params);
                }
            }
            this.RenderState(states, vm, parent, route, params);
        };
        PageViewModelLoader.prototype.CreatePageViewModel = function (state, route, params) {
            var route = Router_1.Router.LookupRoute(state);
            var instance = PageViewModelFactory(this.appContext, route.PageViewModel, params, route.IsPersist);
            this.CreateViews(instance, state, route.Views, params, route.IsPersist);
            return instance;
        };
        PageViewModelLoader.prototype.CreateViews = function (viewModel, state, views, params, isPersist) {
            var _this = this;
            _.each(views, function (view) {
                var viewInstance = ViewModelFactory(_this.appContext, view.ViewModel, params, isPersist);
                viewModel.SideViews.push(viewInstance);
            });
        };
        PageViewModelLoader.prototype.ConstructStateHierarchy = function (state) {
            var strs = state.split(".");
            var states = [];
            var temp = [];
            _.each(strs, function (str) {
                temp.push(str);
                states.push(temp.join('.'));
            });
            return states;
        };
        PageViewModelLoader.prototype.FindPageViewModel = function (state) {
            var viewModel = null;
            var fn = function (obsrv) {
                var vm = ko.unwrap(obsrv);
                if (_.isEmpty(vm))
                    return;
                if (vm.State) {
                    if (vm.State == state) {
                        viewModel = vm;
                        return;
                    }
                }
                fn(vm.PageViewModel);
            };
            fn(this.root);
            return viewModel;
        };
        return PageViewModelLoader;
    }());
    exports.PageViewModelLoader = PageViewModelLoader;
    var ViewModels = {};
    function PageViewModelFactory(appContext, viewModel, params, persist) {
        if (persist) {
            var vm = ViewModels[viewModel.prototype.ViewName];
            if (!vm) {
                vm = new viewModel(appContext, params);
                ViewModels[viewModel.prototype.ViewName] = vm;
            }
            return vm;
        }
        return new viewModel(params);
    }
    function ViewModelFactory(appContext, viewModel, params, persist) {
        if (persist) {
            var vm = ViewModels[viewModel.prototype.ViewName];
            if (!vm) {
                vm = new viewModel(appContext, params);
                ViewModels[viewModel.prototype.ViewName] = vm;
            }
            return vm;
        }
        return new viewModel(params);
    }
});
define("Router", ["require", "exports", "Mediator"], function (require, exports, Mediator_1) {
    "use strict";
    var RouterBase = (function () {
        function RouterBase() {
            this.routes = [];
            var _this = this;
            this.startingUrl = this.myUrl(),
                this.sammy = Sammy();
            this.sammy.get('#/', function () {
                if (_this.startingUrl === _this.myUrl()) {
                    if (_this.defaultRoute) {
                        this.app.runRoute('get', _this.defaultRoute.Url);
                    }
                }
                else {
                    window.location.reload(true);
                    this.unload();
                }
            });
        }
        RouterBase.prototype.myUrl = function () {
            var url = window.location.href;
            if (window.location.hash) {
                url = url.replace(window.location.hash, "");
            }
            if (window.location.search) {
                url = url.replace(window.location.search, "");
            }
            return url;
        };
        RouterBase.prototype.Register = function (routes) {
            var _this = this;
            if (routes) {
                _.each(routes, function (route) {
                    _this.RegisterRoute(route);
                });
            }
        };
        RouterBase.prototype.RegisterRoute = function (route) {
            var _this = this;
            this.routes.push(route);
            if (route.IsDefault) {
                this.defaultRoute = route;
            }
            this.SetupGet(route);
        };
        RouterBase.prototype.LookupRoute = function (state) {
            return _.chain(this.routes).filter(function (route) { return route.State == state; }).first().value();
        };
        RouterBase.prototype.SetupGet = function (route) {
            var _this = this;
            this.sammy.get(route.Url, function (context) {
                Mediator_1.Mediator.Publish(new RouteChangedEvent({
                    Route: route,
                    Params: context.params
                }));
            });
        };
        RouterBase.prototype.GoTo = function (url) {
            this.sammy.setLocation(url);
        };
        RouterBase.prototype.GoBack = function () {
            window.history.back();
        };
        RouterBase.prototype.Run = function () {
            this.sammy.run(this.defaultRoute ? this.defaultRoute.Url : "#/");
        };
        return RouterBase;
    }());
    var routerInstance = new RouterBase();
    var router = {
        Register: function (route) { return routerInstance.RegisterRoute(route); },
        LookupRoute: function (state) { return routerInstance.LookupRoute(state); },
        Run: function () { return routerInstance.Run(); }
    };
    exports.Router = router;
    var RouteChangedEvent = (function (_super) {
        __extends(RouteChangedEvent, _super);
        function RouteChangedEvent(data) {
            _super.call(this);
            this.Topic = "RouteChangedEvent";
            this.Data = data;
        }
        return RouteChangedEvent;
    }(Mediator_1.BaseMessage));
    exports.RouteChangedEvent = RouteChangedEvent;
});
define("Application", ["require", "exports", "Router", "Mediator", "ViewModel"], function (require, exports, Router_2, Mediator_2, VM) {
    "use strict";
    var ApplicationBase = (function () {
        function ApplicationBase(root, appContext, viewModelLoader) {
            this.root = root;
            this.appContext = appContext;
            this.viewModelLoader = viewModelLoader;
            Mediator_2.Mediator.Subscribe(Router_2.RouteChangedEvent, function (data) {
                viewModelLoader.Load(data.Route, data.Params);
            });
        }
        ApplicationBase.prototype.Start = function () {
            ko.applyBindings(this.root);
            Router_2.Router.Run();
        };
        return ApplicationBase;
    }());
    var Application = (function () {
        function Application() {
        }
        Application.OnReady = function (action) {
            if (this._app) {
                action(this._app.appContext);
                return;
            }
            this._onReadyActions.push(action);
        };
        Application.Run = function (configuration, shell) {
            if (!this._app) {
                var appContext = new AppContext(configuration);
                var root = new VM.PageViewModelBase(appContext);
                _.extend(root, shell);
                var viewModelLoader = new VM.PageViewModelLoader(root, appContext);
                this._app = new ApplicationBase(root, appContext, viewModelLoader);
                _.each(this._onReadyActions, function (action) { return action(appContext); });
                this._onReadyActions = [];
                this._app.Start();
            }
        };
        Application._onReadyActions = [];
        return Application;
    }());
    exports.Application = Application;
    var ApplicationStartedEvent = (function (_super) {
        __extends(ApplicationStartedEvent, _super);
        function ApplicationStartedEvent(data) {
            _super.call(this);
            this.Topic = "ApplicationStartedEvent";
            this.Data = data;
        }
        return ApplicationStartedEvent;
    }(Mediator_2.BaseMessage));
    exports.ApplicationStartedEvent = ApplicationStartedEvent;
    var ApplicationErroredEvent = (function (_super) {
        __extends(ApplicationErroredEvent, _super);
        function ApplicationErroredEvent(data) {
            _super.call(this);
            this.Topic = "ApplicationErroredEvent";
            this.Data = data;
        }
        return ApplicationErroredEvent;
    }(Mediator_2.BaseMessage));
    exports.ApplicationErroredEvent = ApplicationErroredEvent;
    var PageRenderedEvent = (function (_super) {
        __extends(PageRenderedEvent, _super);
        function PageRenderedEvent(data) {
            _super.call(this);
            this.Topic = "PageRenderedEvent";
            this.Data = data;
        }
        return PageRenderedEvent;
    }(Mediator_2.BaseMessage));
    exports.PageRenderedEvent = PageRenderedEvent;
    var Configuration = (function () {
        function Configuration() {
        }
        return Configuration;
    }());
    exports.Configuration = Configuration;
    var AppContext = (function () {
        function AppContext(Configuration) {
            this.Configuration = Configuration;
        }
        return AppContext;
    }());
    exports.AppContext = AppContext;
});
define("Decorators", ["require", "exports", "Router", "Application"], function (require, exports, Router_3, Application_1) {
    "use strict";
    function route(url, templateId, isDefault, state, persist) {
        if (isDefault === void 0) { isDefault = false; }
        if (state === void 0) { state = ""; }
        return function route(target) {
            target.prototype.State = state;
            target.prototype.ViewName = templateId;
            var route = {
                Url: url,
                TemplateId: templateId,
                PageViewModel: target,
                IsDefault: isDefault,
                State: state,
                IsPersist: persist || false,
                Views: []
            };
            Router_3.Router.Register(route);
        };
    }
    exports.route = route;
    function registerBindingHandler(name, allowVirtualElement) {
        return function registerBindingHandler(target) {
            ko.bindingHandlers[name] = new target();
            if (allowVirtualElement) {
                ko.virtualElements.allowedBindings[name] = true;
            }
        };
    }
    exports.registerBindingHandler = registerBindingHandler;
    function registerView(viewName, state) {
        return function (target) {
            Application_1.Application.OnReady(function () {
                if (state) {
                    var route = Router_3.Router.LookupRoute(state);
                    if (route) {
                        var view = {
                            TemplateId: viewName,
                            ViewModel: target
                        };
                        route.Views = route.Views || [];
                        route.Views.push(view);
                        target.prototype.ViewName = viewName;
                    }
                    return;
                }
            });
        };
    }
    exports.registerView = registerView;
});
define("BindingHandlers", ["require", "exports", "Decorators", "Mediator", "Application"], function (require, exports, Decorators_1, Mediator_3, Application_2) {
    "use strict";
    var UiViewBindingHandler = (function () {
        function UiViewBindingHandler() {
            var _this = this;
            this.AfterRenderCallBack = function (instance, element) {
                setTimeout(function () {
                    Mediator_3.Mediator.Publish(new Application_2.PageRenderedEvent());
                }, 0);
                if (instance.OnAfterRender) {
                    instance.OnAfterRender(element);
                }
            };
            this.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var viewName = ko.unwrap(valueAccessor());
                if (viewName) {
                    var observableVmArray = bindingContext.$data["SideViews"];
                    observableVmArray.subscribe(function () {
                        var vm = _.find(observableVmArray(), function (v) { return v.ViewName == viewName; });
                        ko.renderTemplate(vm.ViewName, vm, { afterRender: function () { return _this.AfterRenderCallBack(vm, element); } }, element, "replaceNode");
                    });
                    observableVmArray.notifySubscribers();
                }
                else {
                    var observableVm = bindingContext.$data["PageViewModel"];
                    var template = ko.observable({});
                    observableVm.subscribe(function (vm) {
                        var templateId = vm.ViewName;
                        ko.renderTemplate(templateId, vm, { afterRender: function () { return _this.AfterRenderCallBack(vm, element); } }, element, "replaceNode");
                    });
                }
                return { controlsDescendantBindings: true };
            };
        }
        UiViewBindingHandler = __decorate([
            Decorators_1.registerBindingHandler("uiview")
        ], UiViewBindingHandler);
        return UiViewBindingHandler;
    }());
});
//# sourceMappingURL=knockme.js.map