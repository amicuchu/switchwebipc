import React from "react"
import clsx from "clsx"
import {HIDButtonBitField, HIDButtonEvent} from "./WebIPCHID";
import {ActionContext, ActionMap, Action} from "./Contexts/Actions"
import OutlineBox from "./OutlineBox"
import {FocusContext} from "./Contexts/Focus"
import { NavigationContext, NavigationProps } from "./Contexts/Navigation";
import { AnimationContext} from "./Contexts/Animation";

export interface ControlOutputProps{
    reference: React.RefObject<HTMLDivElement>;
    isFocused:boolean;
    isTouched:boolean;
}

interface ControlInputProps{
    children:(props:ControlOutputProps)=>any;
    actionMap?: ActionMap;
    onHIDButton?:(ev:HIDButtonEvent)=>void; 
}

export function Control(props:ControlInputProps){
    const ref = React.useRef<HTMLDivElement>();
    const actionManager = React.useContext(ActionContext);
    const focusProps = React.useContext(FocusContext);
    const navigationProps = React.useContext(NavigationContext);
    const animationManager = React.useContext(AnimationContext); 
    
    const [lastHIDButtonEvent, setLastHIDButtonEvent] = React.useState<HIDButtonEvent>(null);

    //Notify focusability
    React.useEffect(() => {
        focusProps.notifyFocusability(true);
    }, []);
    
    const handleHIDButton = React.useCallback((ev:HIDButtonEvent) => {
        console.log(navigationProps);
        if(props.onHIDButton){
            props.onHIDButton(ev);
            return;
        }
        //Default handler
        if(!ev.pressed) return;
        if(ev.isButtonPressed(HIDButtonBitField.UpPad)){
            console.log("up");
            if(navigationProps.navigateUp){
                navigationProps.navigateUp();
            }else{
                animationManager.execAnimation("bounceUp");
            }
        }else if(ev.isButtonPressed(HIDButtonBitField.DownPad)){
            console.log("down");
            if(navigationProps.navigateDown){
                navigationProps.navigateDown();
            }else{
                animationManager.execAnimation("bounceDown");
            }
        }
    }, [navigationProps]);
    //Event unstaler
    React.useMemo(() => {
        if(lastHIDButtonEvent){
            handleHIDButton(lastHIDButtonEvent);
        }
    }, [lastHIDButtonEvent]);

    React.useMemo(() => {
        if(ref.current){
            //handleGamepadKey is a stale closure, methods from layout must use state in function form
            ref.current.addEventListener("hidButtonEvent", (ev:HIDButtonEvent) => setLastHIDButtonEvent(ev));
            ref.current.tabIndex = -1;
        }
    }, [ref.current]);

    let actionMap = props.actionMap;
    if(!actionMap){
        actionMap = new Map([
            [HIDButtonBitField.A, new Action(HIDButtonBitField.A, "Accept", ()=>{})]
        ]);
    }

    //Focus effect
    React.useEffect(() =>  {
        if(ref.current){
            if(focusProps.focused){
                ref.current.focus();
                actionManager.addActionMapOverlay(actionMap, ref.current);
            }else{
                actionManager.removeActionMapOverlay(ref.current);
            }        
        }
    }, [ref.current, focusProps.focused]);

    //Touch handler
    const [isTouched, setIsTouched] = React.useState(false);

    const handleTouchStart = React.useCallback(() => {
        setIsTouched(true);
        focusProps.grabFocus();
    }, []);

    const handleTouchEnd = React.useCallback(() => {
        setIsTouched(false);
    }, []);

    return <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        {props.children({reference: ref, isFocused: focusProps.focused, isTouched})}
    </div>
}