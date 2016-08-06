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
define(["require", "exports", "Decorators", "ViewModel"], function (require, exports, Decorators_1, ViewModel_1) {
    "use strict";
    var todolistViewModel = (function (_super) {
        __extends(todolistViewModel, _super);
        function todolistViewModel(appContext, params) {
            _super.call(this, appContext, params);
            this.Name = "Hello there i am here kaam ka zero";
            this.OnParamsChange = function (params) {
                console.log("params changes");
            };
        }
        todolistViewModel = __decorate([
            Decorators_1.route("#/list/:id", "ToDoList", true, "list")
        ], todolistViewModel);
        return todolistViewModel;
    }(ViewModel_1.PageViewModelBase));
    var TodoSummaryViewModel = (function (_super) {
        __extends(TodoSummaryViewModel, _super);
        function TodoSummaryViewModel(appContext) {
            _super.call(this, appContext);
            this.Name = "hello side view";
        }
        TodoSummaryViewModel = __decorate([
            Decorators_1.registerView("ToDoSummary", "list")
        ], TodoSummaryViewModel);
        return TodoSummaryViewModel;
    }(ViewModel_1.ViewModelBase));
    var TodoTagsViewModel = (function (_super) {
        __extends(TodoTagsViewModel, _super);
        function TodoTagsViewModel(appContext) {
            _super.call(this, appContext);
            this.Name = "hello side view 2";
        }
        TodoTagsViewModel = __decorate([
            Decorators_1.registerView("ToDoTags", "list")
        ], TodoTagsViewModel);
        return TodoTagsViewModel;
    }(ViewModel_1.ViewModelBase));
});
//# sourceMappingURL=todoviewmodel.js.map