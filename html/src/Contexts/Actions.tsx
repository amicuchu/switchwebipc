import React from "react"
import {HIDButtonBitField} from "../WebIPCHID"

export class Action{
    assignedButton:HIDButtonBitField;
    label:string;
    callback:()=>void;

    constructor(button:HIDButtonBitField, label:string, callback:()=>void){
        this.assignedButton = button;
        this.label = label;
        this.callback = callback;
    }
}

export type ActionMap = Map<HIDButtonBitField,Action>;

class ActionManager{
    actionHandlers:Array<(map:ActionMap)=>void>;
    actions:Array<ActionMap>;
    actionOwners:Map<HTMLElement,ActionMap>;

    constructor(){
        this.actionHandlers = new Array();
        this.actions = new Array();
        this.actionOwners = new Map();
    }

    addActionMapOverlay(actions:ActionMap, actionOwner:HTMLElement){
        console.log("NewActions");
        this.actions.push(actions);
        this.actionOwners.set(actionOwner, actions);
        this.broadcastNewActions();
    }

    removeActionMapOverlay(actionOwner:HTMLElement){
        console.log("ActionsRemoved");
        if(this.actionOwners.has(actionOwner)){
            const actionMap = this.actionOwners.get(actionOwner);
            const actionMapIndex = this.actions.indexOf(actionMap);
            if(actionMapIndex != -1){
                this.actions.splice(actionMapIndex, 1);
            }
            this.actionOwners.delete(actionOwner);
            this.broadcastNewActions();
        }
    }

    cleanUnattachedActions(){
        for(const actionOwner of this.actionOwners.keys()){
            if(actionOwner.parentElement == null){
                const actionMap = this.actionOwners.get(actionOwner);
                const actionMapIndex = this.actions.indexOf(actionMap);
                if(actionMapIndex != -1){
                    this.actions.splice(actionMapIndex, 1);
                }
                this.actionOwners.delete(actionOwner);
            }
        }
    }

    broadcastNewActions(){
        this.cleanUnattachedActions();
        const currentActionMap:ActionMap = new Map();
        for(const actionMap of this.actions){
            for(const [actionButton, action] of actionMap){
                currentActionMap.set(actionButton, action);
            }
        }
        this.actionHandlers.forEach((handler)=>handler(currentActionMap));
    }

    addListener(handler:(map:ActionMap)=>void){
        this.actionHandlers.push(handler);
    }

    removeHandler(handler:(map:ActionMap)=>void){
        
    }


}

export const ActionContext = React.createContext<ActionManager>(null);

export function ActionContextProvider({children}:{children:any}){
    return <ActionContext.Provider value={new ActionManager()}>
        {children}
    </ActionContext.Provider>
}