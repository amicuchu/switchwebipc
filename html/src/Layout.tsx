import React from "react"
import {FocusContext, FocusProps} from "./Contexts/Focus"
import { NavigationContext } from "./Contexts/Navigation"

interface ListLayoutElementProps {
    focusable:boolean;
}

export interface LayoutOutputProps<FocusIndexType>{
    focusedIndex:FocusIndexType;
    getFocusPropsForChild:(focusIndex:FocusIndexType)=>FocusProps;
    isFocusable:(focusIndex:FocusIndexType)=>boolean;
}

interface LayoutInputProps<FocusIndexType>{
    children:(props:LayoutOutputProps<FocusIndexType>)=>any;
}

export function Layout<FocusIndexType>(props:LayoutInputProps<FocusIndexType>){
    
    const [focusedIndex, setFocusedIndex] = React.useState<FocusIndexType>();
    const [focusableList, setFocusableList] = React.useState<Map<FocusIndexType, boolean>>(new Map());

    const focusProps = React.useContext(FocusContext);

    const handleGrabFocus = (index:FocusIndexType) => {
        console.log("Focus grabbed for " + index);
        setFocusedIndex(index);
        if(focusProps && !focusProps.focused) focusProps.grabFocus();
    }

    const handleNotifyFocusability = (index:FocusIndexType, focusability:boolean) => {
        setFocusableList((fl) => {
            const newMap = new Map(fl);
            newMap.set(index, focusability);
            console.log(newMap);
            return newMap;
        });
    }

    const getFocusPropsForChild = (focusIndex:FocusIndexType) =>
        new FocusProps(focusIndex == focusedIndex, 
            handleGrabFocus.bind(null, focusIndex),
            handleNotifyFocusability.bind(null, focusIndex));

    const isFocusable = (focusedIndex:FocusIndexType) => 
        focusableList.has(focusedIndex) ? focusableList.get(focusedIndex) : false;

    return <>
        {props.children({focusedIndex, getFocusPropsForChild, isFocusable})}
    </>
}