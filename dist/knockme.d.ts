/// <reference path="../typings/amplifyjs/amplifyjs.d.ts" />
/// <reference path="../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../typings/knockout.validation/knockout.validation.d.ts" />
declare module "Mediator" {
    export class Mediator {
        static Publish(message: BaseMessage): void;
        static Subscribe(messageType: typeof BaseMessage, callback?: (data?: IPublishData) => boolean | void): ISubscription;
        static Unsubscribe(subscription: ISubscription): void;
    }
    export class BaseMessage {
        Topic: string;
        Data: IPublishData | void;
        static Create(obj: any, messageType?: typeof BaseMessage): BaseMessage;
    }
    export interface IPublishData {
    }
    export interface ISubscription {
        MessageType: typeof BaseMessage;
        CallBack: (data?: IPublishData) => boolean | void;
    }
}
declare module "ViewModel" {
    import { Route, View } from "Router";
    import { BaseMessage } from "Mediator";
    import { AppContext } from "Application";
    export interface IMessageable {
        Subscribe: (message: BaseMessage) => boolean | void;
        Publish(message: BaseMessage): any;
    }
    export interface IViewModelBase extends IMessageable {
        AppContext: AppContext;
        ViewName: string;
        ParentViewModel: ViewModelBase;
        OnAfterRender: (element) => void;
        OnParamsChange: (params) => void;
    }
    export interface IPageViewModelBase extends IViewModelBase {
        State: string;
        PageViewModel: KnockoutObservable<IPageViewModelBase>;
        SideViews: KnockoutObservableArray<ISideViewModelBase>;
    }
    export interface ISideViewModelBase extends IViewModelBase {
    }
    export class ViewModelBase implements IViewModelBase {
        AppContext: AppContext;
        ViewName: string;
        ParentViewModel: ViewModelBase;
        OnAfterRender: (element) => void;
        OnParamsChange: (params) => void;
        Subscribe: (message: BaseMessage) => boolean | void;
        constructor(appContext: AppContext, params?: any);
        Publish(message: BaseMessage): void;
    }
    export class PageViewModelBase extends ViewModelBase implements IPageViewModelBase {
        State: string;
        PageViewModel: KnockoutObservable<IPageViewModelBase>;
        SideViews: KnockoutObservableArray<ISideViewModelBase>;
        constructor(appContext: AppContext, params?: any);
    }
    export class PageViewModelLoader {
        private root;
        private appContext;
        constructor(root: IPageViewModelBase, appContext: AppContext);
        Load(route: Route, params?: any): void;
        RenderState(states: Array<string>, pageViewModel: IPageViewModelBase, parentPageViewModel: IPageViewModelBase, route: Route, params: any): void;
        CreatePageViewModel(state: string, route: Route, params: any): IPageViewModelBase;
        CreateViews(viewModel: IPageViewModelBase, state: string, views: Array<View>, params: any, isPersist: boolean): void;
        ConstructStateHierarchy(state: string): Array<string>;
        FindPageViewModel(state: string): IPageViewModelBase;
    }
}
declare module "Router" {
    import { PageViewModelBase, ViewModelBase } from "ViewModel";
    import { IPublishData, BaseMessage } from "Mediator";
    var router: {
        Register: (route: Route) => void;
        LookupRoute: (state: string) => Route;
        Run: () => void;
    };
    export { router as Router };
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
        ViewModel?: typeof ViewModelBase;
    }
    export class RouteChangedEvent extends BaseMessage {
        constructor(data?: IRouteChangedEventArgs);
    }
    export interface IRouteChangedEventArgs extends IPublishData {
        Route: Route;
        Params?: any;
    }
}
declare module "Application" {
    import { Route } from "Router";
    import { IPublishData, BaseMessage } from "Mediator";
    import * as VM from "ViewModel";
    export class Application {
        private static _app;
        private static _onReadyActions;
        static OnReady(action: (app: AppContext) => void): void;
        static Run(configuration?: Configuration, shell?: any): void;
    }
    export class ApplicationStartedEvent extends BaseMessage {
        constructor(data?: IApplicationStartedEventArgs);
    }
    export interface IApplicationStartedEventArgs extends IPublishData {
        ApplicationName: string;
    }
    export class ApplicationErroredEvent extends BaseMessage {
        constructor(data?: IApplicationErroredEventArgs);
    }
    export interface IApplicationErroredEventArgs extends IPublishData {
        Message: string;
        Method?: string;
    }
    export class PageRenderedEvent extends BaseMessage {
        constructor(data?: IPageRenderedEventArgs);
    }
    export interface IPageRenderedEventArgs extends IPublishData {
        Route: Route;
        ViewModel: VM.ViewModelBase;
    }
    export class Configuration {
    }
    export class AppContext {
        Configuration: Configuration;
        constructor(Configuration: Configuration);
    }
}
declare module "Decorators" {
    import { PageViewModelBase } from "ViewModel";
    export function route(url: string, templateId: string, isDefault?: boolean, state?: string, persist?: boolean): (target: typeof PageViewModelBase) => void;
    export function registerBindingHandler(name: string, allowVirtualElement?: boolean): (target: any) => void;
    export function registerView(viewName: string, state?: string): (target: any) => void;
}
declare module "BindingHandlers" {
}
