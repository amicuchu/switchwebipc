import React from "react";
import {createUseStyles} from "react-jss";
import {NavigationContext, NavigationProps} from "../Contexts/Navigation"
import {Layout, LayoutOutputProps} from "../Layout"
import { FocusContext } from "../Contexts/FocusOld";
import { AnimationContext } from "../Contexts/Animation";
import {ActionContextProvider} from "../Contexts/Actions";
import CommandBar from "../CommandBar";

const useStyles = createUseStyles({
    frame:{
        display: "flex",
        height: "100%",
        flexDirection: "column"
    },
    header:{
        height: 87,
        padding: "0 30px"
    },
    headerContent:{
        margin: "0 30px",
        height: "100%",
        display: "flex",
        alignItems: "center"
    },
    headerText:{
        fontSize: 27
    },
    separator: {
        width: "100%",
        height: "1px",
        backgroundColor: "black"
    },
    mainContainer:{
        position: "relative",
        flexGrow: 1,
        height: 0
    }
});

export default function FramedLayout({children, headerText}:{children:any, headerText:string}){
    const parentNavProps = React.useContext(NavigationContext);
    const animationManager = React.useContext(AnimationContext);
    const classes = useStyles();

    return <Layout<boolean> initialFocusIndex={false}>
        {(props:LayoutOutputProps<boolean>) => {
            /*const navigateBackwards = () => {
                console.log("navBack");
                let newFocusedRow = props.focusedIndex;
                do{
                    newFocusedRow--;
                    if(newFocusedRow < 0) {
                        animationManager.execAnimation("bounceUp");
                        return;
                    }
                }while(!props.isFocusable(newFocusedRow));
                console.log("grabbing " + newFocusedRow);
                props.getFocusPropsForChild(newFocusedRow).grabFocus();
            };

            const navigateForwards = () => {
                console.log("navForward");
                let newFocusedRow = props.focusedIndex;
                do{
                    newFocusedRow++;
                    if(newFocusedRow >= React.Children.count(children)) {
                        animationManager.execAnimation("bounceDown");
                        return;
                    }
                }while(!props.isFocusable(newFocusedRow));
                props.getFocusPropsForChild(newFocusedRow).grabFocus();
            }

            const navProps = new NavigationProps(parentNavProps, horizontal ?
                {navigateLeft:navigateBackwards, navigateRight:navigateForwards} :
                {navigateUp:navigateBackwards, navigateDown:navigateForwards});*/

            return <ActionContextProvider>
                <div className={classes.frame}>
                    <div className={classes.header}>
                        <div className={classes.headerContent}>
                            <div className={classes.headerText}>{headerText}</div>
                        </div>
                        <div className={classes.separator}/>
                    </div>
                    <div className={classes.mainContainer}>
                        {children}
                    </div>
                    <CommandBar/>
                </div>
            </ActionContextProvider>
        }}
    </Layout>
    
}