import React from "react"
import {NavigationContext, NavigationProps} from "./Contexts/Navigation"
import {Layout, LayoutOutputProps} from "./Layout"
import { FocusContext } from "./Contexts/Focus";
import { AnimationContext } from "./Contexts/Animation";

export default function OneAxisLayout({children, horizontal=false}){
    const parentNavProps = React.useContext(NavigationContext);
    const animationManager = React.useContext(AnimationContext);

    return <Layout<number>>
        {(props:LayoutOutputProps<number>) => {
            const navigateBackwards = () => {
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
                {navigateUp:navigateBackwards, navigateDown:navigateForwards});

            return React.Children.map(children, (child, index) => {
                return <FocusContext.Provider value={props.getFocusPropsForChild(index)}>
                    <NavigationContext.Provider value={navProps}>
                        {child}
                    </NavigationContext.Provider>
                </FocusContext.Provider>
            });
        }}
    </Layout>
    
}