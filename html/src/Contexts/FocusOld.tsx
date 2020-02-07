import React from "react";

export const FocusContext = React.createContext<FocusProps>(null);

export class FocusProps{
    focused:boolean;
    grabFocus:()=>void;
    notifyFocusability:(focusability:boolean)=>void;
    notifyElement:(element:HTMLElement)=>void;

    constructor(focused:boolean, grabFocus:()=>void, notifyFocusability:(focusability:boolean)=>void, notifyElement:(element:HTMLElement)=>void){
        this.focused = focused;
        this.grabFocus = grabFocus;
        this.notifyFocusability = notifyFocusability;
        this.notifyElement = notifyElement;
    }
}