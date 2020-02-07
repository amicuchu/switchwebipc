import React from "react";
import {createUseStyles} from "react-jss"
import {useHistory} from "react-router-dom";
import {Screen, ScreenOutputProps} from "../Screen";
import CommandBar from "../CommandBar";
import OneAxisLayout from "../Layouts/OneAxisLayout";
import ListButton from "../ListButton";
import {Action} from "../Contexts/Actions";
import {HIDButtonBitField} from "../WebIPCHID";
import FramedLayout from "../Layouts/FramedLayout";
import { SectionInputProps } from "../Section";

const useStyles = createUseStyles({
    eventLayer:{
        height: "100%",
        width: "100%",
    },
    contentPadder:{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        padding: "43px 90px"
    },
    contentContainer: {
        margin: "3cm"
    }
});

export default function TestMenu(props:SectionInputProps){
    const classes = useStyles();
    const history = useHistory();

    const handleButtonTestLink = () => {
        console.log("BUTTEST");
        history.push("/settings/buttonTest");
    }

    const handleJoystickTestLink = () => {
        console.log("BUTTEST");
        history.push("/settings/joysticksTest");
    }

    const handleTestTextLink = () => {
        console.log("BUTTEST");
        history.push("/test/text");
    }

    const handleExit = React.useCallback(() => {
        if(window.nx){
            window.nx.endApplet();
        }else{
            window.close();
        }
    }, []);

    return <div className={classes.contentPadder}>
        <OneAxisLayout>
            <ListButton onActivate={handleButtonTestLink}>Button test</ListButton>
            <ListButton onActivate={handleJoystickTestLink}>Joystick test</ListButton>
            <ListButton onActivate={handleExit}>Exit</ListButton>
            <ListButton onActivate={handleTestTextLink}>Text text</ListButton>
            <ListButton>2</ListButton>
            <ListButton>3</ListButton>
            <ListButton>4</ListButton>
            <ListButton>5</ListButton>
            <ListButton>6</ListButton>
            <ListButton>7</ListButton>
            <ListButton>8</ListButton>
            <ListButton>9</ListButton>
            <ListButton>10</ListButton>
        </OneAxisLayout>
    </div>
}