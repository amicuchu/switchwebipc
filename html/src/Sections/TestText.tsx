import React from "react";
import clsx from "clsx";
import {createUseStyles} from "react-jss";
import {SectionInputProps} from "../Section"
import Stick from "../Icons/Stick";
import PressedArrow from "../Icons/PressedArrow";
import { HIDJoystickEvent, HIDButtonBitField, HIDButtonEvent } from "../WebIPCHID";
import ButtonX from "../Icons/ButtonX";
import { ActionContext, Action } from "../Contexts/Actions";
import { useHistory } from "react-router-dom";
import OneAxisLayout from "../Layouts/OneAxisLayout";

const useStyles = createUseStyles({
    paddingArea:{
        display: "flex",
        height: "100%",
        width: "100%",
        padding: 20,
        boxSizing: "border-box",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    joystickArea:{
        position: "relative",
        height: 280,
        width: 280,
        marginBottom: 30,
        outline: "none"
    },
    circle:{
        position: "absolute",
        height: "calc(100% - 40px);",
        width: "calc(100% - 40px);",
        margin: 20,
        border: "solid 1px #b0b0b0",
        borderRadius: 1000
    },
    circleTouched:{
        borderColor: "blue"
    },
    verticalLine:{
        position: "absolute",
        left: "50%",
        height: "100%",
        border: "solid 1px #b0b0b0"
    },
    horizontalLine:{
        position: "absolute",
        top: "50%",
        width:"100%",
        border: "solid 1px #b0b0b0"
    },
    touchedLine:{
        borderColor: "blue"
    },
    litleCircle:{
        position: "absolute",
        height: 15,
        width: 15,
        backgroundColor: "blue",
        borderRadius: 100
    },
    textBox:{
        alignSelf: "left"
    },
    headerText:{
        fontSize: 24,
        marginBottom: 25
    },
    listText:{
        marginBottom: 15
    },
    numListText:{
        fontSize: 30,
        paddingRight: 15
    },
    lastText:{
        marginTop: 20,
        fontSize: 24
    },
    separator:{
        width: 1015,
        height: 1,
        margin: "0 -40px",
        marginTop: 5,
        backgroundColor: "#cdcdcd"
    }
});

export default function TestText(props:SectionInputProps){
    const classes = useStyles();
    const actionManager = React.useContext(ActionContext);
    const history = useHistory();
    const ref = React.useRef<HTMLDivElement>();
    
    const [lastHidButtonEvent, setLastHidButtonEvent] = React.useState<HIDButtonEvent>();

    const handleBack = React.useCallback(() => {
        history.goBack();
    }, []);

    React.useEffect(() => {
        if(actionManager){
            actionManager.addActionMapOverlay(new Map([
                [HIDButtonBitField.B, new Action(HIDButtonBitField.B, "Atrás", handleBack)]
            ]), ref.current);
            return () => {
                actionManager.removeActionMapOverlay(ref.current);
            }
        }
    })

    React.useEffect(()=>{
        if(ref.current && !ref.current["hooked"]){
            ref.current.addEventListener("hidButtonEvent", (ev:CustomEvent<HIDButtonEvent>) => setLastHidButtonEvent(ev.detail));
            ref.current.focus();
            ref.current["hooked"] = true;
        }
    }, [ref.current]);

    React.useEffect(() => {
        if(lastHidButtonEvent){
            if(lastHidButtonEvent.isButtonPressed(HIDButtonBitField.B)){
                handleBack();
            }
        }
    })

    return <div ref={ref} className={classes.paddingArea}>
        <OneAxisLayout>
        <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras in dui cursus, venenatis orci ac, semper risus.
            Aliquam maximus ex lectus, id fermentum ligula faucibus sit amet. Interdum et malesuada fames ac ante ipsum primis in faucibus.
            Donec id venenatis turpis. Praesent ac tellus non tortor rutrum iaculis sit amet ac ante. Nam eu ornare tortor.
            Donec a metus eu justo consectetur accumsan eget pretium libero. Aliquam fermentum vitae nulla id pellentesque.
            Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Nulla libero lorem, eleifend eu sem vel, varius blandit ipsum.
            Aliquam placerat, erat vitae ultricies fermentum, dui arcu sodales risus, id hendrerit ante dui id quam.
        </div>
        <div>
            Ut convallis fermentum malesuada.
            Aliquam id dapibus ligula.
            Proin odio augue, porta nec porta eget, sagittis quis erat. Phasellus dignissim placerat metus nec dictum.
            Suspendisse commodo libero sit amet nibh ornare mattis.
            Nulla blandit, leo eget ultricies imperdiet, urna ex cursus justo, id dictum velit eros ullamcorper nunc.
            Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed interdum tellus sed neque euismod euismod.
            Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis quis urna eu nunc egestas volutpat.
            Curabitur ac risus non sem feugiat luctus congue vitae quam.
        </div>
        <div>
            Donec efficitur, nulla sit amet aliquam fringilla, nulla nulla varius diam, vitae dapibus ipsum nisi at mauris.
            Morbi erat odio, interdum sed congue nec, finibus sed elit.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum et vehicula eros.
            Morbi posuere, lorem vel condimentum aliquam, diam mauris ultricies arcu, vel tempus justo nunc in metus.
            Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Fusce accumsan eros ut mauris lobortis, sit amet imperdiet risus interdum.
            Fusce iaculis ornare leo, sit amet facilisis erat egestas ullamcorper.
            Fusce dui lorem, aliquet vel consectetur ut, tristique vitae leo.
            Maecenas eros libero, porttitor vitae leo quis, condimentum facilisis turpis.
            Cras hendrerit ornare est, ac faucibus dolor ullamcorper at.
            Sed lobortis libero iaculis, commodo tortor vestibulum, maximus est.
        </div>
        <div>
            Quisque vulputate massa ut diam elementum, sed feugiat turpis dignissim.
            Pellentesque et metus pretium, sagittis est id, molestie mi. Pellentesque molestie ut nisl in pellentesque.
            Pellentesque quis semper ex, ut interdum dui. Nulla vel massa eu magna sodales iaculis. Etiam id semper turpis.
            Pellentesque mi metus, volutpat sed mi ut, hendrerit luctus turpis. Duis id fringilla odio, quis porttitor sem.
            Quisque ac est suscipit, auctor tortor eu, volutpat augue. Suspendisse ac interdum nibh, ac cursus leo.
            Vivamus vel mollis nulla, ut iaculis quam.
        </div>
        <div>
        Aenean at eleifend neque, eget sagittis sem. Proin nunc augue, mollis eu aliquam id, faucibus ac magna. Cras molestie pulvinar justo, ut consectetur risus suscipit sodales. Phasellus sed tincidunt magna. Maecenas ullamcorper eleifend aliquet. Duis ullamcorper lorem metus, quis venenatis orci pharetra eget. Integer volutpat semper lobortis. Donec est lectus, eleifend ut risus ut, congue lobortis turpis. Morbi suscipit sed quam eget pharetra. Fusce ullamcorper posuere est, vitae tincidunt risus porta eget. Maecenas non ornare nunc, varius mattis magna. Vestibulum dignissim lacus eu neque consectetur condimentum. Maecenas vel semper odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam aliquam sapien sem, vitae vestibulum leo mollis in.
        </div>
        </OneAxisLayout>
    </div>
}

