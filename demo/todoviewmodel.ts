
///<reference path="../dist/knockme.d.ts"/>


import {route, registerView} from "Decorators"
import {ViewModelBase, PageViewModelBase} from "ViewModel"


@route("#/list/:id", "ToDoList", true, "list")
class todolistViewModel extends PageViewModelBase {
    Name = "Hello there i am here kaam ka zero"
    constructor(appContext, params) {
        super(appContext,params);
    }

    OnParamsChange=(params)=>{
        console.log("params changes");
    }
}




@registerView("ToDoSummary", "list")
class TodoSummaryViewModel extends ViewModelBase {

    Name = "hello side view";
    constructor(appContext) {
        super(appContext);
    }
}

@registerView("ToDoTags", "list")
class TodoTagsViewModel extends ViewModelBase {

    Name = "hello side view 2";
    constructor(appContext) {
        super(appContext);
    }
}



