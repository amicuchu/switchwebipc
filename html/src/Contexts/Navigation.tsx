import React from "react";

export const NavigationContext = React.createContext<NavigationProps>(null);

export class NavigationLayer{
    navigateLeft:()=>void;
    navigateUp:()=>void;
    navigateRight:()=>void;
    navigateDown:()=>void;

    constructor(){
        
    }
}

class NavigationManager{
    nextID:number;
    navLayers:NavigationLayer[];
    navLayersByOwner:Map<number, NavigationLayer>;
    constructor(){

    }

    addNavigationLayer(layer:NavigationLayer){
        const id = this.nextID++;
        this.navLayers.push(layer);
        this.navLayersByOwner.set(id, layer);
        return id;
    }

    removeNavigationLayer(id:number){
        if(this.navLayersByOwner.has(id)){
            const layer = this.navLayersByOwner.get(id);
            const layerIndex = this.navLayers.indexOf(layer);
            if(layerIndex !== -1) this.navLayers.splice(layerIndex, 1);
        }else{
            console.warn("Navigation layer was already removed");
        }
    }

    isNavigationTriggered(){

    }

    isJoystickTriggeringNavigation(){
        
    }

    isHorizontalNavigation(){
        
    }

    isScrolling(){
        
    }

    getScrollXSpeed(){

    }

    getScrollYSpeed(){

    }
    
    
}

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