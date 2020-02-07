import React, { EventHandler } from "react"
import clsx from "clsx"
import {HIDButtonBitField, HIDButtonEvent} from "./WebIPCHID";
import {ActionContext, ActionMap, Action} from "./Contexts/Actions"
import OutlineBox from "./OutlineBox"
import {FocusContext} from "./Contexts/FocusOld"
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
    directlyActivable?: boolean;
    onHIDButton?:(ev:HIDButtonEvent)=>void; 
    onActivate?:()=>void;
}

export function Control(props:ControlInputProps){
    const ref = React.useRef<HTMLDivElement>();
    const actionManager = React.useContext(ActionContext);
    const focusProps = React.useContext(FocusContext);
    const navigationProps = React.useContext(NavigationContext);
    const animationManager = React.useContext(AnimationContext);
    
    const [isTouched, setIsTouched] = React.useState(false);
    const [lastHIDButtonEvent, setLastHIDButtonEvent] = React.useState<HIDButtonEvent>(null);
    const [lastTouchStartEvent, setLastTouchStartEvent] = React.useState<TouchEvent>(null);
    const [lastTouchEndEvent, setLastTouchEndEvent] = React.useState<TouchEvent>(null);
    const [lastTouchCancelEvent, setLastTouchCancelEvent] = React.useState<TouchEvent>(null);

    const directlyActivable = props.directlyActivable !== undefined ? props.directlyActivable : true;
    const handleActivate = props.onActivate !== undefined ? props.onActivate : () => {};
    const isFocused = focusProps ? focusProps.focused : false;

    //Notify focusability
    React.useEffect(() => {
        if(focusProps) focusProps.notifyFocusability(true);
        return () => {
            //Be sure that actions get unlinked
            if(actionManager) actionManager.removeActionMapOverlay(ref.current);
        }
    }, []);
    
    const handleHIDButton = React.useCallback((ev:HIDButtonEvent) => {
        if(props.onHIDButton){
            props.onHIDButton(ev);
            return;
        }
        //Default handler
        if(!ev.pressed) return;
        if(ev.isButtonPressed(HIDButtonBitField.UpPad)){
            if(navigationProps.navigateUp){
                navigationProps.navigateUp();
            }else{
                animationManager.execAnimation("bounceUp");
            }
        }else if(ev.isButtonPressed(HIDButtonBitField.DownPad)){
            if(navigationProps.navigateDown){
                navigationProps.navigateDown();
            }else{
                animationManager.execAnimation("bounceDown");
            }
        }else if(ev.isButtonPressed(HIDButtonBitField.LeftPad)){
            if(navigationProps.navigateLeft){
                navigationProps.navigateLeft();
            }else{
                animationManager.execAnimation("bounceLeft");
            }
        }else if(ev.isButtonPressed(HIDButtonBitField.RightPad)){
            if(navigationProps.navigateRight){
                navigationProps.navigateRight();
            }else{
                animationManager.execAnimation("bounceRight");
            }
        }else if(ev.isButtonPressed(HIDButtonBitField.A)){
            handleActivate();
        }
    }, [navigationProps]);

    //Event unstaler
    React.useEffect(() => {
        if(lastHIDButtonEvent){
            handleHIDButton(lastHIDButtonEvent);
        }
    }, [lastHIDButtonEvent]);
    React.useEffect(() => {
        if(lastTouchStartEvent){
            setIsTouched(true);
        }
    }, [lastTouchStartEvent]);
    React.useEffect(() => {
        if(lastTouchEndEvent){
            setIsTouched(false);
            const touch = lastTouchEndEvent.changedTouches[0];
            if(document.elementsFromPoint(touch.clientX, touch.clientY).indexOf(ref.current) !== -1){
                if(!directlyActivable){
                    focusProps.grabFocus();
                }else{
                    handleActivate();
                }
            }
        }
    }, [lastTouchEndEvent]);
    React.useEffect(() => {
        if(lastTouchCancelEvent){
            setIsTouched(false);
        }
    }, [lastTouchCancelEvent]);

    //We don't know shape of the control so we must intercept events using a reference
    //React events stay in bubbling phase of root element, stopPropagation is useless there
    React.useEffect(() => {
        if(ref.current && !ref.current["hooked"]){
            if(focusProps) focusProps.notifyElement(ref.current);
            //handleGamepadKey is a stale closure, methods from layout must use state in function form
            if(navigationProps){
                ref.current.addEventListener("hidButtonEvent", (ev:CustomEvent<HIDButtonEvent>) => {
                    setLastHIDButtonEvent(ev.detail);
                });
            }
            ref.current.addEventListener("touchstart", (ev:TouchEvent) => {
                console.log("Control startTouch");
                setLastTouchStartEvent(ev);
                if(!directlyActivable) ev.stopPropagation();
            });
            ref.current.addEventListener("touchend", (ev:TouchEvent) => {
                console.log("Control endTouch");
                setLastTouchEndEvent(ev);
                //ev.stopPropagation();
            });
            ref.current.addEventListener("touchcancel", (ev:TouchEvent) => {
                console.log("Control cancelTouch");
                setLastTouchCancelEvent(ev);
                //ev.stopPropagation();
            });
            ref.current.tabIndex = -1;
            ref.current["hooked"] = true;
        }
    }, [ref.current]);

    let actionMap = props.actionMap;
    if(!actionMap){
        actionMap = new Map([
            [HIDButtonBitField.A, new Action(HIDButtonBitField.A, "Accept", ()=>{handleActivate()})]
        ]);
    }

    //Focus effect
    React.useEffect(() =>  {
        if(ref.current && actionManager){
            if(isFocused){
                ref.current.focus();
                if(!ref.current["actionsHooked"]){
                    actionManager.addActionMapOverlay(actionMap, ref.current);
                    ref.current["actionsHooked"] = true;
                }
            }else{
                if(ref.current["actionsHooked"]){
                    actionManager.removeActionMapOverlay(ref.current);
                    ref.current["actionsHooked"] = false;
                }
            }
        }
    }, [ref.current, isFocused]);

    return <>
        {props.children({reference: ref, isFocused, isTouched})}
    </>
}