import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"
import {Control, ControlOutputProps} from "./Control"
import OutlineBox from "./OutlineBox"
import { ActionMap } from "./Contexts/Actions"

const useStyles = createUseStyles({
    listButton: {
        position: "relative",
        border: "solid #d1d1d1",
        borderWidth: "1px 0 0 0",
        outline: "none"
    },
    listButtonActive: {
        backgroundColor: "#fdfdfd"
    },
    contentBox: {
        padding: "20px 15px"
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

export default function ListButton({children, actionMap}:{children:any, actionMap?:ActionMap}){
    const classes = useStyles();


    return <Control actionMap={actionMap}>
        {({reference, isFocused, isTouched}:ControlOutputProps) =>
            <div ref={reference}
                    className={clsx(classes.listButton,
                                    isFocused && classes.listButtonActive)}>
                <div className={clsx(classes.contentBox,
                    isTouched && classes.contentBoxHover)}>
                    {children}
                </div>
                <OutlineBox visible={isFocused}/>
            </div>
        }
    </Control>
    
}