
import { BaseMessage, Mediator} from "Mediator"
import {Application} from "Application"

export class Resource<TKey, TEntity> {

    private AjaxSetting: JQueryAjaxSettings;

    public IsSubmitting: boolean = false;

    public IsLoading: boolean = false;

    constructor(private webApiBase: string, public ResourceName: string, public IsCacheEnabled: boolean = false) {
        this.AjaxSetting = {
            url: `${this.webApiBase}/${this.ResourceName}`,
            contentType: "application/json; charset=utf-8",
        };
    }

    private Call(ajaxSetting?: JQueryAjaxSettings): JQueryPromise<any> {
        var deferred = $.Deferred();
        var promise = $.ajax(ajaxSetting || this.AjaxSetting);
        promise.done((data) => {
            deferred.resolve(data);
        });

        promise.fail((data) => {
            var eventArgs = <IOnAjaxRequestErrorEvent>{};
            eventArgs.Status = data.status;
            switch (data.status) {
                case ResponseCode.InternalServerError,
                    ResponseCode.NotFound,
                    ResponseCode.Unauthorized:
                    break;
                case ResponseCode.BadRequest:
                    var responseData = data.responseJSON;
                    if (responseData) {
                        eventArgs.Message = responseData.Message;
                        eventArgs.ModelState = responseData.ModelState;
                    }
                    break;
            }
            Mediator.Publish(new OnAjaxRequestErrorEvent(eventArgs));
            deferred.reject(eventArgs);
        });

        promise.always(() => {
            this.IsSubmitting = false;
            this.IsLoading = false;
        });
        return deferred.promise();
    }

    private async CallAsync(ajaxSetting?: JQueryAjaxSettings): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            var jQueryPromise = this.Call(ajaxSetting);
            jQueryPromise.done(data => resolve(data));
            jQueryPromise.fail(data => reject(data))
        });
    }

    GetWithOptions<TOption>(entity: TOption): JQueryPromise<Array<TEntity>> {
        this.IsLoading = true;
        this.AjaxSetting.type = "GET";
        this.AjaxSetting.data = entity;
        return this.Call();
    }

    GetAll(params: any = null): JQueryPromise<Array<TEntity>> {
        this.IsLoading = true;
        this.AjaxSetting.type = "GET";
        this.AjaxSetting.data = params;
        return this.Call();
    }


    async GetAllAsync(params: any = null): Promise<Array<TEntity>> {
        return new Promise<Array<TEntity>>((resolve, reject) => {
            this.GetAll(params)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    Get(id?: TKey): JQueryPromise<TEntity> {
        this.IsLoading = true;
        this.AjaxSetting.url = `${this.webApiBase}/${this.ResourceName}/${id}`;
        this.AjaxSetting.type = "GET";
        return this.Call();
    }

    async GetAsync(id?: TKey): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Get(id)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    Put(entity: TEntity | any): JQueryPromise<any> {
        this.IsSubmitting = true;
        this.AjaxSetting.type = "PUT";
        this.AjaxSetting.data = JSON.stringify(entity);
        return this.Call();
    }

    async PutAsync(entity: TEntity | any): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Put(entity)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    Post(entity: TEntity): JQueryPromise<any> {
        this.IsSubmitting = true;
        this.AjaxSetting.type = "POST";
        this.AjaxSetting.data = JSON.stringify(entity);
        return this.Call();
    }

    async PostAsync(entity: TEntity): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Post(entity)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    Ajax(ajaxSettings: JQueryAjaxSettings): JQueryPromise<any> {
        return this.Call(ajaxSettings);
    }

    async AjaxAsync(ajaxSettings: JQueryAjaxSettings): Promise<any> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Ajax(ajaxSettings)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    Delete(entity: TEntity): JQueryPromise<any> {
        this.IsSubmitting = true;
        this.AjaxSetting.type = "DELETE";
        this.AjaxSetting.data = entity;
        return this.Call();
    }

    async DeleteAsync(entity: TEntity): Promise<any> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Delete(entity)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }

    DeleteById(id: TKey): JQueryPromise<any> {
        this.IsSubmitting = true;
        this.AjaxSetting.url = `${this.webApiBase}/${this.ResourceName}/${id}`;
        this.AjaxSetting.type = "DELETE";
        return this.Call();
    }

    async DeleteByIdAsync(id: TKey): Promise<any> {
        return new Promise<TEntity>((resolve, reject) => {
            this.DeleteById(id)
                .done(data => resolve(data))
                .fail(data => reject(data))
        });
    }
}

export class GenericResource extends Resource<any, any>{ }

export function Ajax(ajaxSetting: JQueryAjaxSettings): JQueryPromise<any> {
    var resource = new GenericResource(null, null);
    return resource.Ajax(ajaxSetting);
}

export async function AjaxAsync(ajaxSetting: JQueryAjaxSettings): Promise<any> {
    var resource = new GenericResource(null, null);
    return await resource.AjaxAsync(ajaxSetting);
}

export class OnAjaxRequestErrorEvent extends BaseMessage {
    constructor(data?: IOnAjaxRequestErrorEvent) {
        super();
        this.Topic = "OnAjaxRequestErrorEvent";
        this.Data = data;
    }
}

export interface IApplicationErrorEvent {
    Status: ResponseCode,
    Message?: string;
}

export interface IOnAjaxRequestErrorEvent extends IApplicationErrorEvent {
    ModelState: Object;
}

export interface IServerResponse {
    Message: string;
    ModelState: any;
}

export enum ResponseCode {
    BadRequest = 400,
    InternalServerError = 500,
    Unauthorized = 401,
    NotFound = 404
}