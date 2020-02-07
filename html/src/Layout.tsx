import React from "react"
import {FocusContext, FocusProps} from "./Contexts/FocusOld"
import { NavigationContext } from "./Contexts/Navigation"

interface ListLayoutElementProps {
    focusable:boolean;
}

export interface LayoutOutputProps<FocusIndexType>{
    focusedIndex:FocusIndexType;
    focusElementList:Map<FocusIndexType, HTMLElement>
    getFocusPropsForChild:(focusIndex:FocusIndexType)=>FocusProps;
    getElementForChild:(focusIndex:FocusIndexType)=>HTMLElement;
    isFocusable:(focusIndex:FocusIndexType)=>boolean;
    isAnyFocusable:()=>boolean;
}

interface LayoutInputProps<FocusIndexType>{
    children:(props:LayoutOutputProps<FocusIndexType>)=>any;
    initialFocusIndex:FocusIndexType;
}

export function Layout<FocusIndexType>(props:LayoutInputProps<FocusIndexType>){
    
    const [focusedIndex, setFocusedIndex] = React.useState<FocusIndexType>(props.initialFocusIndex);
    const [focusableList, setFocusableList] = React.useState<Map<FocusIndexType, boolean>>(new Map());
    const [focusElementList, setFocusElementList] = React.useState<Map<FocusIndexType, HTMLElement>>(new Map());

    const focusProps = React.useContext(FocusContext);

    const isFocusedLayout = React.useMemo(() => {
        if(focusProps){
            return focusProps.focused;
        }else{
            return true;
        }
    }, [focusProps && focusProps.focused]);

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

    const handleNotifyElement = (index:FocusIndexType, element:HTMLElement) => {
        setFocusElementList((fl) => {
            const newMap = new Map(fl);
            newMap.set(index, element);
            return newMap;
        });
    }

    const getFocusPropsForChild = (focusIndex:FocusIndexType) =>
        new FocusProps(focusIndex == focusedIndex && isFocusedLayout, 
            handleGrabFocus.bind(null, focusIndex),
            handleNotifyFocusability.bind(null, focusIndex),
            handleNotifyElement.bind(null, focusIndex));

    const getElementForChild = (focusIndex:FocusIndexType) => 
        focusElementList.has(focusIndex) ? focusElementList.get(focusIndex) : null;

    const isFocusable = (focusedIndex:FocusIndexType) => 
        focusableList.has(focusedIndex) ? focusableList.get(focusedIndex) : false;

    const isAnyFocusable = () => 
        Array.from(focusableList.values()).reduce((previous, current) => previous || current, false)

    return <>
        {props.children({focusedIndex, getFocusPropsForChild, isFocusable, focusElementList, getElementForChild, isAnyFocusable})}
    </>
}