
///<reference path="../../typings/sammyjs/sammyjs.d.ts"/>

import {PageViewModelBase, ViewModelBase} from "./ViewModel"
import {Mediator, IPublishData, BaseMessage}  from "./Mediator"


class RouterBase {

    private sammy: Sammy.Application;
    private defaultRoute: Route;
    private startingUrl: string;
    private routes: Array<Route> = []

    constructor() {
        var _this = this;
        this.startingUrl = this.myUrl(),
            this.sammy = Sammy();
        this.sammy.get('#/', function () {
            if (_this.startingUrl === _this.myUrl()) {
                if (_this.defaultRoute) {
                    this.app.runRoute('get', _this.defaultRoute.Url);
                }
            } else {
                window.location.reload(true);
                this.unload();
            }
        });
    }

    private myUrl() {
        var url = window.location.href;
        if (window.location.hash) {
            url = url.replace(window.location.hash, "");
        }
        if (window.location.search) {
            url = url.replace(window.location.search, "");
        }
        return url;
    }

    Register(routes: Route[]) {
        var _this = this;
        if (routes) {
            // Register a list of routes
            _.each(routes, function (route) {
                _this.RegisterRoute(route);
            });
        }
    }

    RegisterRoute(route: Route) {
        var _this = this;
        this.routes.push(route);
        if (route.IsDefault) {
            this.defaultRoute = route;
        }
        this.SetupGet(route);
    }

    LookupRoute(state: string): Route {
        return _.chain(this.routes).filter(route => route.State == state).first().value();
    }

    SetupGet(route: Route) {
        var _this = this;
        this.sammy.get(route.Url, function (context) { //context is 'this'
            Mediator.Publish(new RouteChangedEvent({
                Route: route,
                Params: context.params
            }));
        });
    }

    GoTo(url: string) {
        this.sammy.setLocation(url);
    }

    GoBack() {
        window.history.back();
    }

    Run() {
        this.sammy.run(this.defaultRoute?this.defaultRoute.Url:"#/");     
    }
}

var routerInstance: RouterBase = new RouterBase();

var router = {

    Register: (route: Route) => routerInstance.RegisterRoute(route),
    LookupRoute: (state: string) => routerInstance.LookupRoute(state),
    Run: () => routerInstance.Run()

};

export { router as Router}

export interface Route {
    Url: string;
    State?: string;
    TemplateId: string;
    PageViewModel: typeof PageViewModelBase;
    IsDefault: boolean;
    IsPersist?: boolean;
    Views: Array<View>;
}

export interface View {
    TemplateId: string;
    ViewModel?: typeof ViewModelBase
}

export class RouteChangedEvent extends BaseMessage {
    constructor(data?: IRouteChangedEventArgs) {
        super();
        this.Topic = "RouteChangedEvent";
        this.Data = data;
    }
}

export interface IRouteChangedEventArgs extends IPublishData {
    Route: Route;
    Params?: any;
}