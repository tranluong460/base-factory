import { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core';

export declare const EN: {
    "log_process_run": {
        "automated": {
            "action_example": {
                "start": "Start action example for automated {{1}} | Key target: {{0}}",
                "end": "End action example for automated {{1}} | Key target: {{0}}"
            }
        },
        "direct_api": {
            "action_example": {
                "start": "Start action example for direct_api {{1}} | Key target: {{0}}",
                "end": "End action example for direct_api {{1}} | Key target: {{0}}"
            }
        },
        "scripted": {
            "action_example": {
                "start": "Start action example for scripted {{1}} | Key target: {{0}}",
                "end": "End action example for scripted {{1}} | Key target: {{0}}"
            }
        }
    }
};

export declare enum EnumLabsProvider {
    SCRIPTED = "scripted",
    AUTOMATED = "automated",
    DIRECT_API = "direct_api"
}

export declare interface IAutomatedProvider {
    start: () => Promise<void>;
}

export declare interface IDirectApiProvider {
    start: () => Promise<void>;
}

export declare interface ILabsProviderFactory {
    create: (payload: IPayloadProvider<EnumLabsProvider>) => IScriptedProvider | IAutomatedProvider | IDirectApiProvider;
}

export declare type IPayloadProvider<T extends EnumLabsProvider> = {
    type: T;
    keyTarget: string;
    logUpdate: ITypeLogUpdate<'mkt_labs'>;
} & PayloadConfigMap[T];

export declare interface IScriptedProvider {
    start: () => Promise<void>;
}

export declare const KO: {
    "log_process_run": {
        "automated": {
            "action_example": {
                "start": "자동화에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
                "end": "자동화에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
            }
        },
        "direct_api": {
            "action_example": {
                "start": "Direct API에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
                "end": "Direct API에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
            }
        },
        "scripted": {
            "action_example": {
                "start": "스크립트에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
                "end": "스크립트에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
            }
        }
    }
};

export declare class LabsPluginLoader {
    static loadPlugin(providerId: EnumLabsProvider): Promise<void>;
}

export declare class LabsProviderFacade {
    static getProvider<T extends EnumLabsProvider>(payload: IPayloadProvider<T>): Promise<ProviderTypeMap[T]>;
}

export declare class LabsProviderRegistry {
    private static factories;
    static register(type: EnumLabsProvider, factory: ILabsProviderFactory): void;
    static getFactory(type: EnumLabsProvider): ILabsProviderFactory;
    static listProviders(): string[];
}

export declare interface PayloadConfigMap {
    [EnumLabsProvider.SCRIPTED]: {
        example: {
            example1: string;
            example2: number;
        };
    };
    [EnumLabsProvider.AUTOMATED]: {
        example: {
            example1: string;
            example2: number;
        };
    };
    [EnumLabsProvider.DIRECT_API]: {
        example: {
            example1: string;
            example2: number;
        };
    };
}

export declare interface ProviderTypeMap {
    [EnumLabsProvider.SCRIPTED]: IScriptedProvider;
    [EnumLabsProvider.AUTOMATED]: IAutomatedProvider;
    [EnumLabsProvider.DIRECT_API]: IDirectApiProvider;
}

export declare const VI: {
    "log_process_run": {
        "automated": {
            "action_example": {
                "start": "Bắt đầu thực hiện action example cho automated {{1}} | Key target: {{0}}",
                "end": "Kết thúc thực hiện action example cho automated {{1}} | Key target: {{0}}"
            }
        },
        "direct_api": {
            "action_example": {
                "start": "Bắt đầu thực hiện action example cho direct_api {{1}} | Key target: {{0}}",
                "end": "Kết thúc thực hiện action example cho direct_api {{1}} | Key target: {{0}}"
            }
        },
        "scripted": {
            "action_example": {
                "start": "Bắt đầu thực hiện action example cho scripted {{1}} | Key target: {{0}}",
                "end": "Kết thúc thực hiện action example cho scripted {{1}} | Key target: {{0}}"
            }
        }
    }
};

export { }


declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }
}
