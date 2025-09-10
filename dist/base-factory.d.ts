import { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core';

declare class BusinessApiActions {
    private readonly logger;
    constructor();
    startApi(): Promise<void>;
}

declare class BusinessAutomatedActions {
    private readonly logger;
    constructor();
    startAutomated(): Promise<void>;
}

declare class BusinessScriptedActions {
    private readonly logger;
    constructor();
    startScripted(): Promise<void>;
}

export declare const EN: {
    "log_process_run": {}
};

export declare enum EnumFacebookProvider {
    WWW = "www",
    BUSINESS = "business"
}

export declare class FacebookPluginLoader {
    static loadPlugin(providerId: EnumFacebookProvider): Promise<void>;
}

export declare class FacebookProviderFacade {
    static getProvider<T extends EnumFacebookProvider>(payload: IPayloadProvider): Promise<ProviderTypeMap[T]>;
}

export declare class FacebookProviderRegistry {
    private static factories;
    static register(type: EnumFacebookProvider, factory: IFacebookProviderFactory): void;
    static getFactory(type: EnumFacebookProvider): IFacebookProviderFactory;
    static listProviders(): string[];
}

export declare interface IBusinessProvider {
    readonly useApi: BusinessApiActions;
    readonly useAutomated: BusinessAutomatedActions;
    readonly useScripted: BusinessScriptedActions;
}

export declare interface IFacebookProviderFactory {
    create: (payload: IPayloadProvider) => IWWWProvider | IBusinessProvider;
}

export declare interface IPayloadProvider<T = EnumFacebookProvider> {
    type: T;
    logUpdate: ITypeLogUpdate;
}

export declare interface IWWWProvider {
    readonly useApi: WWWApiActions;
    readonly useAutomated: WWWAutomatedActions;
    readonly useScripted: WWWScriptedActions;
}

export declare const KO: {
    "log_process_run": {}
};

export declare interface ProviderTypeMap {
    [EnumFacebookProvider.WWW]: IWWWProvider;
    [EnumFacebookProvider.BUSINESS]: IBusinessProvider;
}

export declare const VI: {
    "log_process_run": {}
};

declare class WWWApiActions {
    private readonly logger;
    private payload;
    constructor(payload: IPayloadProvider);
    startApi(): Promise<void>;
}

declare class WWWAutomatedActions {
    private readonly logger;
    private payload;
    constructor(payload: IPayloadProvider);
    startAutomated(): Promise<void>;
}

declare class WWWScriptedActions {
    private readonly logger;
    private payload;
    constructor(payload: IPayloadProvider);
    startScripted(): Promise<void>;
}

export { }
