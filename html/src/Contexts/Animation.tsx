import React from "react"

export const AnimationContext = React.createContext<AnimationManager>(null);

function isElementInDocument(element:HTMLElement){
    while(element.parentElement){
        element = element.parentElement;
        if(element == document.body) return true;
    }
    return false;
}

class AnimationManager{
    animations:Map<string,()=>void>;
    animationOwners:Map<string,HTMLElement>;
    constructor(){
        this.animations = new Map();
        this.animationOwners = new Map();
    }

    registerAnimation(name:string, callback:()=>void, animationOwner:HTMLElement){
        this.animations.set(name, callback);
        console.assert(isElementInDocument(animationOwner), "Element not attached");
        this.animationOwners.set(name, animationOwner);
    }

    unregisterUnattachedOwners(name:string){
        if(this.animationOwners.has(name)){
            const animationOwner = this.animationOwners.get(name);
            if(!isElementInDocument(animationOwner)){
                this.animationOwners.delete(name);
                this.animations.delete(name);
            }
        }
    }

    execAnimation(name:string){
        console.log(this.animations);
        if(this.animations.has(name)){
            this.animations.get(name)();
        }else{
            console.warn("Animation " + name + " isn't registered");
        }
    }
}

export function AnimationContextProvide({children}:{children:any}){
    return <AnimationContext.Provider value={new AnimationManager()}>
        {children}
    </AnimationContext.Provider>
}