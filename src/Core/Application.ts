
///<reference path="../../typings/knockout.validation/knockout.validation.d.ts"/>

import { Router, Route, View, RouteChangedEvent, IRouteChangedEventArgs } from "./Router"
import {Mediator, IPublishData, BaseMessage} from "./Mediator"
import * as VM from "./ViewModel"
import {GenericResource} from "Resource"


class ApplicationBase {

    constructor(private root: VM.IPageViewModelBase, public appContext: AppContext, private viewModelLoader) {
        Mediator.Subscribe(RouteChangedEvent, (data: IRouteChangedEventArgs) => {
            //load the viewmodel
            viewModelLoader.Load(data.Route, data.Params)
        });
    }

    Start() {
        ko.applyBindings(this.root);
        Router.Run();
    }
}

export class Application {

    private static _app: ApplicationBase;
    private static _onReadyActions: Array<(appContext: AppContext) => void> = [];

    static OnReady(action: (app: AppContext) => void) {
        if (this._app) {
            action(this._app.appContext);
            return;
        }
        this._onReadyActions.push(action);
    }

    static async GetAsync(pathSegment): Promise<any> {
        var resource = new GenericResource(null, null);
        var ajaxSetting = {
            url: `${this._app.appContext.Configuration.WebApiBase}/${pathSegment}`
        };
        return resource.AjaxAsync(ajaxSetting);
    }

    static ApiAsync(resourceName: string): GenericResource {
        return new GenericResource(this._app.appContext.Configuration.WebApiBase, resourceName);
    }

    static Run(configuration?: Configuration, shell?: any) {
        if (!this._app) {

            var appContext = new AppContext(configuration);
            var root = new VM.PageViewModelBase(appContext);
            _.extend(root, shell);
            var viewModelLoader = new VM.PageViewModelLoader(root, appContext);

            this._app = new ApplicationBase(root, appContext, viewModelLoader);

            _.each(this._onReadyActions, action => action(appContext));
            this._onReadyActions = [];

            this._app.Start();
        }
    }
}

export class ApplicationStartedEvent extends BaseMessage {
    constructor(data?: IApplicationStartedEventArgs) {
        super();
        this.Topic = "ApplicationStartedEvent";
        this.Data = data;
    }
}

export interface IApplicationStartedEventArgs extends IPublishData {
    ApplicationName: string;
}

export class ApplicationErroredEvent extends BaseMessage {
    constructor(data?: IApplicationErroredEventArgs) {
        super();
        this.Topic = "ApplicationErroredEvent";
        this.Data = data;
    }
}

export interface IApplicationErroredEventArgs extends IPublishData {
    Message: string;
    Method?: string;
}

export class PageRenderedEvent extends BaseMessage {
    constructor(data?: IPageRenderedEventArgs) {
        super();
        this.Topic = "PageRenderedEvent";
        this.Data = data;
    }
}

export interface IPageRenderedEventArgs extends IPublishData {
    Route: Route;
    ViewModel: VM.ViewModelBase;
}

export class Configuration {
    WebApiBase: string;
    ApplicationPath: string;
}

export class AppContext {
    constructor(public Configuration: Configuration) {
    }
}







