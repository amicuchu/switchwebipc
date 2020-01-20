import React from "react"
import {createUseStyles} from "react-jss"
import CommandButton from "./CommandButton"
import ButtonA from "./Icons/ButtonA";

const useStyles = createUseStyles({
    commandBar: {
        boxSizing: "border-box",
        position: "absolute",
        width: "100%",
        height: "70px",
        bottom: "0",
        padding: "0 30px"
    },
    separator: {
        width: "100%",
        height: "1px",
        backgroundColor: "black"
    }
});

export default function CommandBar(){
    const classes = useStyles();

    return <div className={classes.commandBar}>
        <div className={classes.separator}/>
        <CommandButton iconButton={<ButtonA/>} text="Give food"/>
    </div>
}