import {registerBindingHandler} from "Decorators"
import { IViewModelBase} from "ViewModel"
import {Mediator} from "Mediator"
import {PageRenderedEvent} from "Application"

@registerBindingHandler("uiview")
class UiViewBindingHandler implements KnockoutBindingHandler {

  AfterRenderCallBack = (instance: IViewModelBase, element) => {
    setTimeout(() => {
      Mediator.Publish(new PageRenderedEvent());
    }, 0);
    if (instance.OnAfterRender) {
      instance.OnAfterRender(element);
    }
  }

  init = (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
    let viewName = ko.unwrap(valueAccessor());

    if (viewName) {
      var observableVmArray = bindingContext.$data["SideViews"];
      observableVmArray.subscribe(() => {
        var vm = _.find(observableVmArray(), (v: IViewModelBase) => v.ViewName == viewName);
        ko.renderTemplate(vm.ViewName, vm, { afterRender: () => this.AfterRenderCallBack(vm, element) }, element, "replaceNode");
      });
      observableVmArray.notifySubscribers();
    } else {
      var observableVm = bindingContext.$data["PageViewModel"];
      var template = ko.observable({});
      observableVm.subscribe((vm) => {
        var templateId = vm.ViewName;
        ko.renderTemplate(templateId, vm, { afterRender: () => this.AfterRenderCallBack(vm, element) }, element, "replaceNode");
      });
    }

    return { controlsDescendantBindings: true };
  }
} 