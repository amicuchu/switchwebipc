import React from "react"
import {createUseStyles} from "react-jss"
import {BrowserRouter as Router, Route, MemoryRouter, RouteChildrenProps} from "react-router-dom"


import CommandBar from "./CommandBar"
import OneAxisLayout from "./Layouts/OneAxisLayout"
import ListButton from "./ListButton"
import {ActionContextProvider, Action} from "./Contexts/Actions"
import { AnimationContextProvide as AnimationContextProvider } from "./Contexts/Animation"
import { HIDButtonBitField } from "./WebIPCHID"
import TestMenu from "./Sections/TestMenu";
import Transition from "./Transition";
import TestButtons from "./Screens/TestButtons"
import FramedScreen from "./Screens/FramedScreen"
import TestJoysticks from "./Sections/TestJoysticks"
import TestText from "./Sections/TestText"

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

    return <AnimationContextProvider>
            <MemoryRouter>
                <div className={classes.appContainer}>
                    <FramedScreen>
                        <TestMenu path="/" headerName="Test menu"/>
                        <TestJoysticks path="/settings/joysticksTest" headerName="Joysticks"/>
                        <TestText path="/test/text" headerName="Text test"/>
                    </FramedScreen>
                    <Route path="/settings/buttonTest">
                        {(routeProps:RouteChildrenProps) => {
                            return <Transition visible={routeProps.match != null}>
                                <TestButtons/>
                            </Transition>
                        }}
                    </Route>
                </div>
            </MemoryRouter>
        </AnimationContextProvider>
}