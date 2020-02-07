import React, { useState } from "react";
import {createUseStyles} from "react-jss";
import {useLocation, useRouteMatch} from "react-router-dom";
import {NavigationContext, NavigationProps} from "../Contexts/Navigation"
import {Layout, LayoutOutputProps} from "../Layout"
import FramedLayout from "../Layouts/FramedLayout"
import {Screen, ScreenOutputProps} from "../Screen"
import {SectionInputProps} from "../Section";
import { FocusContext } from "../Contexts/FocusOld";
import { AnimationContext } from "../Contexts/Animation";
import {ActionContextProvider} from "../Contexts/Actions";
import CommandBar from "../CommandBar";
import Transition from "../Transition";

const useStyles = createUseStyles({
    eventLayer:{
        width: "100%",
        height: "100%"
    }
})

export default function FramedScreen({children}:{children:any}){
    let headerName = null;
    const classes = useStyles();

    console.log("Pre children");

    const rchildren = React.Children.map(children, (child:React.Component<SectionInputProps>) => {
        if(React.isValidElement(child)){
            const match = useRouteMatch({path: child.props.path, exact: true});
            console.log("Match method");
            console.log(!!match);
            if(match){
                headerName = child.props.headerName;
            }
            return <Transition visible={!!match} transition="slide">{React.cloneElement(child, {match})}</Transition>
        }else{
            return child;
        }
    });
    
    return <Transition visible={!!headerName}>
        <Screen>
            {(props:ScreenOutputProps) => 
                <div ref={props.reference as React.Ref<HTMLDivElement>} className={classes.eventLayer}>
                    <FramedLayout headerText={headerName}>
                        {rchildren}
                    </FramedLayout>
                </div>
            }
        </Screen>
    </Transition>
}