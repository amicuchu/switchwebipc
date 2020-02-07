import React from "react";
import {HIDButtonEvent} from "./WebIPCHID"
import {FocusContext, FocusProps} from "./Contexts/FocusOld"

export interface ScreenOutputProps{
    reference: React.RefObject<HTMLElement>;
}

interface ScreenInputProps{
    children:(props:ScreenOutputProps)=>any;
    useFocusManager?:boolean
}

export function Screen(props:ScreenInputProps){
    const [isFocused, setIsFocused] = React.useState(true);
    const [lastTouchStartEv, setLastTouchStartEv] = React.useState<TouchEvent>(null);
    const [lastHIDButtonEv, setLastHIDButtonEv] = React.useState<HIDButtonEvent>(null);
    const ref = React.useRef<HTMLElement>();
    const handleHIDButtonRef = React.useRef((ev:CustomEvent<HIDButtonEvent>) => {
        setLastHIDButtonEv(ev.detail);
    });

    const useFocusManager = props.useFocusManager === undefined ? true : props.useFocusManager;

    const grabFocus = React.useCallback(() => setIsFocused(true), []);
    const notifyFocusability = React.useCallback(() => {}, []);

    const focusProps = useFocusManager ? new FocusProps(isFocused, grabFocus, notifyFocusability, ()=>{}) : null;

    React.useEffect(() => {
        document.addEventListener("hidButtonEvent", handleHIDButtonRef.current, false);
        return () => {
            document.removeEventListener("hidButtonEvent", handleHIDButtonRef.current);
        };
    }, []);

    React.useEffect(() => {
        if(ref.current){
            //Pattern to unstale callbacks
            ref.current.addEventListener("touchstart", (ev:TouchEvent) => setLastTouchStartEv(ev), false);
        }
    }, [ref.current]);

    React.useEffect(() => {
        if(lastTouchStartEv){
            console.log("Screen startTouch");
            setIsFocused(false);
        }
    }, [lastTouchStartEv]);

    React.useEffect(() => {
        if(lastHIDButtonEv){
            setIsFocused(true);
        }
    }, [lastHIDButtonEv]);

    return <FocusContext.Provider value={focusProps}>
        {props.children({reference: ref})}
    </FocusContext.Provider>
}