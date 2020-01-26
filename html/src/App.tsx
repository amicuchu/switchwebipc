import React from "react"
import {createUseStyles} from "react-jss"

import CommandBar from "./CommandBar"
import OneAxisLayout from "./OneAxisLayout"
import ListButton from "./ListButton"
import {ActionContextProvider, Action} from "./Contexts/Actions"
import { AnimationContextProvide as AnimationContextProvider } from "./Contexts/Animation"
import { HIDButtonBitField } from "./WebIPCHID"

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
    
    const [focusedRow, setFocusedRow] = React.useState();

    return <ActionContextProvider>
        <AnimationContextProvider>
            <div className={classes.appContainer}>
                <div className={classes.contentContainer}>
                    <OneAxisLayout>
                        <ListButton>Hello world</ListButton>
                        <ListButton>Hello world</ListButton>
                        <ListButton actionMap={new Map([[HIDButtonBitField.X, new Action(HIDButtonBitField.X, "Purge", ()=>{})]])}>Hello world</ListButton>
                        <ListButton>Hello world</ListButton>
                    </OneAxisLayout>
                </div>
                <CommandBar/>
            </div>
        </AnimationContextProvider>
    </ActionContextProvider>
}