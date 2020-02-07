import {HIDSubmodule} from "./WebIPCHID"

export type NXKey = "A"|"B"|"X"|"Y"|"L"|"R"|"ZL"|"ZR"|"StickLPress";
export type NXSound = "SeFooterDecideBack"|"SeWebNaviFocus"|"SeWebKeyError"|"SeWebPointerFocus"|"SeWebLinkDecide"|
    "SeWebButtonDecide"|"SeWebCheckboxCheck"|"SeWebCheckboxUncheck"|"SeWebRadioBtnOn"|"SeWebMenuListOpen"|"SeWebTextboxStartEdit"|
    "SeBtnDecide"|"SeWebZoomIn"|"SeWebZoomOut"|"SeWebChangeCursorPointer"|"SeWebTouchFocus"|"SeTextAreaMove";

export interface NXNamespace extends EventListener{
    sendMessage:(data:string) => boolean;
    addEventListener:(eventType:string, callback:EventListener) => void;
    endApplet:() => void;
    footer:{
        setFixed:(state:"shown"|"hidden")=>void,
        setAssign:(key:NXKey, label:string, func:()=>void, options:{se:NXSound|""})=>void
    }
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

