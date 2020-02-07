import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"
import ButtonA from "./Icons/ButtonA"

const useStyles = createUseStyles({
    commandButton: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "5px",
        padding: "18px 21px",
        margin: "5px 0"
    },
    commandButtonActive: {
        backgroundColor: "#00f5ff17"
    },
    text: {
        marginLeft: "12px"
    }
});

export default function CommandButton({iconButton, text, callback}:{iconButton:React.ReactElement, text:string, callback:()=>void}){
    const classes = useStyles();
    const ref = React.useRef<HTMLDivElement>();

    const [isTouched, setIsTouched] = React.useState(false);
    const [lastTouchStartEvent, setLastTouchStartEvent] = React.useState<TouchEvent>(null);
    const [lastTouchEndEvent, setLastTouchEndEvent] = React.useState<TouchEvent>(null);
    const [lastTouchCancelEvent, setLastTouchCancelEvent] = React.useState<TouchEvent>(null);

    //useMemo only updates when the dependecies changes and render runs!!!
    React.useEffect(() => {
        if(ref.current){
            //handleGamepadKey is a stale closure, methods from layout must use state in function form
            ref.current.addEventListener("touchstart", (ev:TouchEvent) => {
                setLastTouchStartEvent(ev);
                ev.stopPropagation();
            });
            ref.current.addEventListener("touchend", (ev:TouchEvent) => {
                setLastTouchEndEvent(ev);
                ev.stopPropagation();
            });
            ref.current.addEventListener("touchcancel", (ev:TouchEvent) => {
                setLastTouchCancelEvent(ev);
                ev.stopPropagation();
            });
        }
    }, [ref.current]);

    React.useEffect(() => {
        if(lastTouchStartEvent){
            setIsTouched(true);
        }
    }, [lastTouchStartEvent]);
    React.useEffect(() => {
        if(lastTouchEndEvent){
            setIsTouched(false);
            callback();
        }
    }, [lastTouchEndEvent]);
    React.useEffect(() => {
        if(lastTouchCancelEvent){
            setIsTouched(false);
        }
    }, [lastTouchCancelEvent]);

    return <div ref={ref} className={clsx(classes.commandButton, isTouched && classes.commandButtonActive)}>
        {iconButton}<span className={classes.text}>{text}</span>
    </div>
}