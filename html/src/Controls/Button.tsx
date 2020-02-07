import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"
import {Control, ControlOutputProps} from "../Control"
import OutlineBox from "../OutlineBox"
import { ActionMap } from "../Contexts/Actions"

const useStyles = createUseStyles({
    button: {
        position: "relative",
        border: "solid 2px black",
        borderRadius: 5,
        outline: "none"
    },
    buttonActive: {
        backgroundColor: "#fdfdfd"
    },
    contentBox: {
        width: "100%",
        padding: "20px 0px",
        textAlign: "center"
    },
    contentBoxHover: {
        backgroundColor: "#00f5ff17"
    },
    outlineBox: {
        position: "absolute",
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

interface ButtonInputProps{
    children:any;
    actionMap?:ActionMap;
    onActivate?:()=>void;
    className?:string;
    width?:number;
}

export default function Button(props:ButtonInputProps){
    const classes = useStyles();
    const className = props.className ? props.className : null; 

    return <Control actionMap={props.actionMap} onActivate={props.onActivate}>
        {({reference, isFocused, isTouched}:ControlOutputProps) =>
            <div ref={reference}
                    className={clsx(className, classes.button,
                                    isFocused && classes.buttonActive)}>
                <div className={clsx(classes.contentBox,
                    isTouched && classes.contentBoxHover)}>
                    {props.children}
                </div>
                <OutlineBox visible={isFocused}/>
            </div>
        }
    </Control>
    
}