export declare enum EnumProvider {
    NAME = "name"
}

declare interface IProvider {
    start: () => Promise<boolean>;
}

export declare class ProviderFacade {
    static getProvider(type: EnumProvider): Promise<IProvider>;
}

export { }
