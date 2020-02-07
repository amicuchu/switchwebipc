import React from "react";

export const FocusContext = React.createContext<FocusManager>(null);
export const FocusParentIDContext = React.createContext<number>(null);


class FocusLayer<FocusIndexType>{
    manager:FocusManager;
    id:number;
    parentID:number;
    currentPrecisePath:FocusIndexType;
    precisePathResolver:(index:FocusIndexType)=>number;
    eventListeners:{[key:string]:Array<(ev:CustomEvent)=>void>};
    focusable:boolean;
    element:HTMLElement;
    focused:boolean;

    constructor(manager:FocusManager, id:number, parentID:number){
        this.manager = manager;
        this.nullify();
        this.id = id;
        this.parentID = parentID;
    }

    nullify(){
        this.parentID = null;
        this.focused = false;
        this.focusable = false;
        this.element = null;
    }

    grabFocus(){
        this.manager.grabFocus(this.id);
    }

    setPrecisePathResolver(func:(index:FocusIndexType)=>number){
        this.precisePathResolver = func;
    }

    setPrecisePath(index:FocusIndexType){
        this.currentPrecisePath = index;
        this.manager.grabFocus(this.precisePathResolver(index));
    }

    addEventListener(type:string, func:(ev:CustomEvent)=>void){
        if(this.eventListeners[type] == null){
            this.eventListeners[type] = [];
        }
        this.eventListeners[type].push(func);
    }

}

class FocusManager{
    nextID:number;
    focusLayers: Map<number, FocusLayer<unknown>>;
    focusTree: Map<number, number[]>;
    currentFocus: number;
    currentPath: number[];

    constructor(){
        this.nextID = 1;
        this.focusLayers = new Map();
        this.focusTree = new Map([[0, []]]);
        this.currentFocus = null;
    }

    private getPath(id:number) {
        console.assert(this.focusLayers.has(id));
        const path = [];
        let layer = this.focusLayers.get(id);
        do{
            path.unshift(layer.id);
            layer = this.focusLayers.has(layer.parentID) ? this.focusLayers.get(layer.parentID) : null;
        }while(layer);
        return path;
    }

    createFocusLayer(parentID:number=0){
        if(parentID === 0){
            if(this.focusTree.get(parentID).length > 0) throw "Root already ocupied"
        }else if(!this.focusLayers.has(parentID)){
            throw "Invalid parent ID";
        }
        const layer = new FocusLayer(this, this.nextID++, parentID);
        this.focusLayers.set(layer.id, layer);
        this.focusTree.get(parentID).push(layer.id);
        this.focusTree.set(layer.id, []);
        return layer;
    }

    removeFocusLayer(id:number){
        if(!this.focusLayers.has(id)){
            throw "Invalid ID";
        }
        const layer = this.focusLayers.get(id);
        /*for(let child of this.focusTree.get(id)){
            this.removeFocusLayer(child);
        }*/
        this.focusLayers.delete(id);
        this.focusTree.delete(id);
        layer.nullify();
    }

    grabFocus(id:number){
        const oldPath = this.getPath(this.currentFocus);
        const newPath = this.getPath(id);
        for(let focusLayerID of oldPath.reverse()){
            if(newPath.indexOf(focusLayerID) !== -1) break;
            this.focusLayers.get(focusLayerID).focused = false;
        }

        for(let focusLayerID of newPath){
            if(oldPath.indexOf(focusLayerID) !== -1) continue;
            this.focusLayers.get(focusLayerID).focused = true;
        }

        this.currentFocus = id;
    }

    dispatchEvent(ev:CustomEvent){
        if(this.focusLayers.has(this.currentFocus)){
            const dispatchList = this.focusLayers.get(this.currentFocus).eventListeners[ev.type];
            if(dispatchList != null) dispatchList.forEach((listener) => listener(ev));
        }
    }

}