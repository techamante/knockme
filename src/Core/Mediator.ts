
///<reference path="../../typings/amplifyjs/amplifyjs.d.ts"/>



export class Mediator {
    static Publish(message: BaseMessage) {
        amplify.publish(message.Topic, message.Data);
    }

    static Subscribe(messageType: typeof BaseMessage, callback?: (data?: IPublishData) => boolean | void): ISubscription {
        var message = new messageType();
        amplify.subscribe(message.Topic, callback);
        return {
            MessageType: messageType,
            CallBack: callback
        }
    }

    static Unsubscribe(subscription: ISubscription) {
        var message = new subscription.MessageType();
        amplify.unsubscribe(message.Topic, subscription.CallBack);
    }
}

export class BaseMessage {
    Topic: string;
    Data: IPublishData | void;

    static Create(obj: any, messageType: typeof BaseMessage = BaseMessage): BaseMessage {
        var message = new messageType();
        return _.extend(message, obj);
    }
}

export interface IPublishData {

}

export interface ISubscription {
    MessageType: typeof BaseMessage;
    CallBack: (data?: IPublishData) => boolean | void;

}

