import {HIDSubmodule} from "./WebIPCHID"

export interface NXNamespace extends EventListener{
    sendMessage:(data:string) => boolean;
    addEventListener:(eventType:string, callback:EventListener) => void;
}

export interface MessageEvent extends Event{
    data:string;
}

declare global {
    interface Window {
        nx:NXNamespace;
        webIPC:{
            hid:HIDSubmodule;
        }
    }
}

