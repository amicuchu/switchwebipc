import React from "react";

export const NavigationContext = React.createContext<NavigationProps>(null);

interface NewNavigationFuncs{
    navigateLeft?:()=>void;
    navigateUp?:()=>void;
    navigateRight?:()=>void;
    navigateDown?:()=>void;
}

export class NavigationProps{
    navigateLeft:()=>void;
    navigateUp:()=>void;
    navigateRight:()=>void;
    navigateDown:()=>void;

    constructor(oldProps:NavigationProps=null, newFuncs:NewNavigationFuncs={}){
        if(oldProps){
            this.navigateLeft = oldProps.navigateLeft;
            this.navigateUp = oldProps.navigateUp;
            this.navigateRight = oldProps.navigateRight;
            this.navigateDown = oldProps.navigateDown;
        }else{
            this.navigateLeft = null;
            this.navigateUp = null;
            this.navigateRight = null;
            this.navigateDown = null;
        }
        if(newFuncs.navigateLeft) this.navigateLeft = newFuncs.navigateLeft;
        if(newFuncs.navigateUp) this.navigateUp = newFuncs.navigateUp;
        if(newFuncs.navigateRight) this.navigateRight = newFuncs.navigateRight;
        if(newFuncs.navigateDown) this.navigateDown = newFuncs.navigateDown;
    }
}