import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"
import {HIDButtonBitField, HIDButtonEvent} from "./WebIPCHID"
import { AnimationContext } from "./Contexts/Animation";

const useStyles = createUseStyles({
    outlineBox: {
        position: "absolute",
        pointerEvents: "none",
        top: "0px",
        height: "100%",
        width: "100%",
        border: "4px solid",
        margin: "-2px",
        borderRadius: "4px",
        borderColor: "#59fcdd",
        boxShadow: "0px 1px 3px 0px #06bcc7",
        zIndex: 1
    } 
});

export default function OutlineBox({visible} : {visible:boolean}){
    const classes = useStyles();
    const ref = React.useRef<HTMLDivElement>();
    const animationManager = React.useContext(AnimationContext);

    React.useEffect(()=>{
        if(ref.current){
            ref.current.animate([
                {borderColor: "#59fcdd"},
                {borderColor: "#06bcc7"},
                {borderColor: "#59fcdd"}
            ], {duration: 1000, iterations: Infinity});
        }
    }, [visible]);

    const bounceUp = React.useCallback(() => {
        ref.current.animate([
            {transform: "translateY(0px)"},
            {transform: "translateY(-10px)", state:0.4},
            {transform: "translateY(0px)", state:0.8},
            {transform: "translateY(-5px)", state:0.9},
            {transform: "translateY(0px)"}
        ], {duration: 200, iterations: 1});
    }, [ref.current]);

    const bounceDown = React.useCallback(() => {
        ref.current.animate([
            {transform: "translateY(0px)"},
            {transform: "translateY(10px)", state:0.4},
            {transform: "translateY(0px)", state:0.8},
            {transform: "translateY(5px)", state:0.9},
            {transform: "translateY(0px)"}
        ], {duration: 200, iterations: 1});
    }, [ref.current]);

    const bounceLeft = React.useCallback(() => {
        ref.current.animate([
            {transform: "translateX(0px)"},
            {transform: "translateX(-10px)", state:0.4},
            {transform: "translateX(0px)", state:0.8},
            {transform: "translateX(-5px)", state:0.9},
            {transform: "translateX(0px)"}
        ], {duration: 200, iterations: 1});
    }, [ref.current]);

    const bounceRight = React.useCallback(() => {
        ref.current.animate([
            {transform: "translateX(0px)"},
            {transform: "translateX(10px)", state:0.4},
            {transform: "translateX(0px)", state:0.8},
            {transform: "translateX(5px)", state:0.9},
            {transform: "translateX(0px)"}
        ], {duration: 200, iterations: 1});
    }, [ref.current]);

    //Ref.current is unreliable as effect dependency
    React.useEffect(() => {
        if(animationManager){
            if(ref.current){
                animationManager.registerAnimation("bounceUp", bounceUp, ref.current);
                animationManager.registerAnimation("bounceDown", bounceDown, ref.current);
                animationManager.registerAnimation("bounceLeft", bounceLeft, ref.current);
                animationManager.registerAnimation("bounceRight", bounceRight, ref.current);
            }else{
                animationManager.unregisterUnattachedOwners("bounceUp");
                animationManager.unregisterUnattachedOwners("bounceDown");
                animationManager.unregisterUnattachedOwners("bounceLeft");
                animationManager.unregisterUnattachedOwners("bounceRight");
            }
        }
    }, [visible]);

    return <>
        {visible && <div className={classes.outlineBox} ref={ref}/>}
    </>
}