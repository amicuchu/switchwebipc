import React from "react"
import {createUseStyles} from "react-jss"

import CommandBar from "./CommandBar"
import ListButton from "./ListButton"

const useStyles = createUseStyles({
    appContainer: {
        position: "fixed",
        width: 1280,
        height:720,
        backgroundColor: "#ebebeb"
    },
    contentContainer: {
        margin: "3cm"
    }
});

export default function App(){
    const classes = useStyles();
    return <div className={classes.appContainer}>
        <div className={classes.contentContainer}>
            <ListButton>Hello world</ListButton>
            <ListButton>Hello world</ListButton>
            <ListButton>Hello world</ListButton>
            <ListButton>Hello world</ListButton>
        </div>
        <CommandBar/>
    </div>
}