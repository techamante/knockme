

export interface ICacheableResource {
    IsCacheEnabled: boolean;
    ResourceName: string;
}

export class MemoryCache {

    static Set(key: string, value: any) {
        amplify.store.memory(key, value);
    }

    static Get(key: string): any {
        return amplify.store.memory(key);
    }

    static Exists(key: string): boolean {
        var data = amplify.store.memory(key);
        return data != null
    }

    static Remove(key: string) {
        amplify.store.memory(key, null);
    }
}