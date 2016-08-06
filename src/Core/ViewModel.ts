import {Route, Router, View} from "./Router"
import {BaseMessage}  from "./Mediator"
import { AppContext } from "./Application"


export interface IMessageable {
    Subscribe: (message: BaseMessage) => boolean | void;
    Publish(message: BaseMessage);
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
    SideViews: KnockoutObservableArray<ISideViewModelBase>
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
    constructor(appContext: AppContext, params?: any) {
        this.AppContext = appContext;
    }

    Publish(message: BaseMessage) {
        if (this.ParentViewModel != null) {
            if (this.ParentViewModel.Subscribe) {
                if (!this.ParentViewModel.Subscribe(message)) {
                    this.ParentViewModel.Publish(message);
                }
            } else {
                this.ParentViewModel.Publish(message);
            }
        }
    }
}

export class PageViewModelBase extends ViewModelBase implements IPageViewModelBase {
    State: string;
    PageViewModel = ko.observable<IPageViewModelBase>();
    SideViews = ko.observableArray<ISideViewModelBase>();
    constructor(appContext: AppContext, params?: any) {
        super(appContext, params);
    }
}

export class PageViewModelLoader {

    constructor(private root: IPageViewModelBase, private appContext: AppContext) { }

    Load(route: Route, params?: any) {
        var states = this.ConstructStateHierarchy(route.State);
        this.RenderState(states, this.root, null, route, params);
    }

    RenderState(states: Array<string>, pageViewModel: IPageViewModelBase, parentPageViewModel: IPageViewModelBase, route: Route, params: any) {
        if (states.length == 0) return;

        let parent = pageViewModel;
        var state = states.shift()
        var vm = this.FindPageViewModel(state)
        if (!vm) {
            vm = this.CreatePageViewModel(state, route, params);
            vm.ParentViewModel = parent;
            parent.PageViewModel(vm);
        } else {
            if (vm.OnParamsChange) {
                vm.OnParamsChange(params);
            }
        }
        this.RenderState(states, vm, parent, route, params);
    }

    CreatePageViewModel(state: string, route: Route, params): IPageViewModelBase {
        var route = Router.LookupRoute(state);
        var instance = PageViewModelFactory(this.appContext, route.PageViewModel, params, route.IsPersist);
        this.CreateViews(instance, state, route.Views, params, route.IsPersist)
        return instance;
    }


    CreateViews(viewModel: IPageViewModelBase, state: string, views: Array<View>, params: any, isPersist: boolean) {
        _.each(views, view => {
            var viewInstance = ViewModelFactory(this.appContext, view.ViewModel, params, isPersist);
            viewModel.SideViews.push(viewInstance);

        });
    }

    ConstructStateHierarchy(state: string): Array<string> {
        var strs = state.split(".");
        var states = [];
        var temp = [];
        _.each(strs, str => {
            temp.push(str);
            states.push(temp.join('.'));
        });
        return states;
    }

    FindPageViewModel(state: string): IPageViewModelBase {
        var viewModel = null;
        var fn = (obsrv) => {
            var vm:IPageViewModelBase = ko.unwrap(obsrv);
            if (_.isEmpty(vm)) return;
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
    }
}

let ViewModels: {
    [id: string]: IViewModelBase
} = {};

function PageViewModelFactory(appContext: AppContext, viewModel: typeof PageViewModelBase, params: any, persist: boolean): IPageViewModelBase {
    if (persist) {
        var vm = ViewModels[viewModel.prototype.ViewName] as IPageViewModelBase;
        if (!vm) {
            vm = new viewModel(appContext, params);
            ViewModels[viewModel.prototype.ViewName] = vm;
        }
        return vm;
    }
    return new viewModel(params);
}


function ViewModelFactory(appContext: AppContext, viewModel: typeof ViewModelBase, params: any, persist: boolean): IViewModelBase {
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



