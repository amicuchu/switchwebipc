import {WebIPC, WebIPCRequest, WebIPCError} from "./WebIPC"

export enum HIDButtonBitField{
    A = 1 << 0,
    B = 1 << 1,
    X = 1 << 2,
    Y = 1 << 3,
    LeftStick = 1 << 4,
    RightSitck = 1 << 5,
    L = 1 << 6,
    R = 1 << 7,
    ZL = 1 << 8,
    ZR = 1 << 9,
    Plus = 1 << 10,
    Minus = 1 << 11,
    LeftPad = 1 << 12,
    UpPad = 1 << 13,
    RightPad = 1 << 14,
    DownPad = 1 << 15,
    SLLeft = 1 << 24,
    SRLeft = 1 << 25,
    SLRight = 1 << 26,
    SRRight = 1 << 27
}



export class HIDButtonEvent extends Event{
    button:HIDButtonBitField
    pressed:boolean
    constructor(bt:HIDButtonBitField, pr:boolean){
        super("hidButtonEvent", {bubbles: true});
        this.button = bt;
        this.pressed = pr;
    }

    isButtonPressed(button:HIDButtonBitField){
        return !!(this.button&button) && this.pressed;
    }
}


export class HIDSubmodule{
    coordinator:WebIPC;
    hidEventRequest:WebIPCRequest;

    constructor(coord:WebIPC){
        this.coordinator = coord;
        this.hidEventRequest = null;
    }

    activateHIDEvents(){
        this.hidEventRequest = new WebIPCRequest(1, 0, null, this.handleHIDEvent.bind(this));
        this.coordinator.sendRequest(this.hidEventRequest);
    }

    isHIDEventsActive(){
        return this.hidEventRequest != null;
    }

    handleHIDEvent(data:any, lastMessage:boolean){
        if(lastMessage) this.hidEventRequest = null;
    }

}

export class HIDSubmoduleSimulation extends HIDSubmodule{
    timeHandle:any;
    lastButtonReading:boolean[];
    handleKeyDownBind:(ev:KeyboardEvent)=>void;
    
    constructor(){
        super(null);
        this.lastButtonReading = new Array(10).fill(0);
    }

    activateHIDEvents(){
        this.timeHandle = setInterval(() => {
            this.pollGamepads();
        }, 1000);
        this.handleKeyDownBind = this.handleKeyDown.bind(this);
        document.addEventListener("keydown", this.handleKeyDownBind);
    }

        
    static readonly buttonMapping:{[key: number]: HIDButtonBitField} = {
        0: HIDButtonBitField.B,
        1: HIDButtonBitField.A,
        2: HIDButtonBitField.Y,
        3: HIDButtonBitField.X,
        4: HIDButtonBitField.L,
    };

    handleKeyDown(ev:KeyboardEvent){
        console.log(ev);
        if(ev.key === "ArrowUp"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.UpPad, true));
        }else if(ev.key === "ArrowDown"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.DownPad, true));
        }
    }

    pollGamepads(){
        const gamepads = navigator.getGamepads();
        if(gamepads.length > 0 && gamepads[0]){
            let gamepad = gamepads[0];
            let releasedKeys:HIDButtonBitField = 0;
            let pressedKeys:HIDButtonBitField = 0;

            this.lastButtonReading = this.lastButtonReading.map((lastReading, index) => {
                const newReading = gamepad.buttons[index].pressed;
                if(lastReading != newReading){
                    if(newReading){
                        pressedKeys |= HIDSubmoduleSimulation.buttonMapping[index];
                    }else{
                        releasedKeys |= HIDSubmoduleSimulation.buttonMapping[index];
                    }
                }
                return gamepad.buttons[index].pressed;
            });
            pressedKeys > 0 && document.activeElement.dispatchEvent(new HIDButtonEvent(pressedKeys, true));
            releasedKeys > 0 && document.activeElement.dispatchEvent(new HIDButtonEvent(releasedKeys, false));
        }
    }

    deactivateHIDEvents(){
        clearInterval(this.timeHandle);
        document.removeEventListener("keydown",this.handleKeyDownBind);
    }
}