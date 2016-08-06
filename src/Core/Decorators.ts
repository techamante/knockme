
import { Router } from "Router"
import {Application} from "Application"
import { PageViewModelBase } from "ViewModel"
import {ICacheableResource, MemoryCache} from "Caching"

export function route(url: string, templateId: string, isDefault: boolean = false, state: string = "", persist?: boolean) {
  return function route(target: typeof PageViewModelBase) {
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

    Router.Register(route);
  }
}

export function registerBindingHandler(name: string, allowVirtualElement?: boolean) {
  return function registerBindingHandler(target: any) {
    ko.bindingHandlers[name] = new target();
    if (allowVirtualElement) {
      ko.virtualElements.allowedBindings[name] = true;

    }
  }
}

export function registerView(viewName: string, state?: string) {
  return function (target: any) {
    Application.OnReady(() => {
      //Multi View support
      if (state) {
        var route = Router.LookupRoute(state);
        if (route) {
          var view = {
            TemplateId: viewName,
            ViewModel: target
          }
          route.Views = route.Views || [];
          route.Views.push(view);
          target.prototype.ViewName = viewName;
        }
        return;
      }
    });
  }
}



export function cache(target: Object, key: string, value: any) {
  return {
    value: function (...args: any[]) {
      if (isCacheableResource(this)) {
        var cacheableResource = <ICacheableResource>this;
        var cacheKey = `${cacheableResource.ResourceName}.${key}.${JSON.stringify(args)}`;
        var isCacheEnabled = cacheableResource.IsCacheEnabled;
        var deferred = $.Deferred();
        if (cacheableResource.IsCacheEnabled && MemoryCache.Exists(cacheKey)) {
          deferred.resolve(MemoryCache.Get(cacheKey));
          return deferred.promise();
        } else {
          return value.value.apply(this, args).done((data) => {
            if (cacheableResource.IsCacheEnabled) {
              MemoryCache.Set(cacheKey, data);
            }
          });
        }
      } else {
        return value.value.apply(this, args);
      }
    }
  }
}

function isCacheableResource(object: any): object is ICacheableResource {
  return 'IsCacheEnabled' in object
}

