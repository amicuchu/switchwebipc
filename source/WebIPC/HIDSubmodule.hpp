#pragma once

#include <array>
#include <thread>
#include <switch.h>
#include "WebIPCHandler.hpp"


struct ControllerStatus{
    bool connected = false;
    HidControllerType type;
    HidPowerInfo battery[2];
    JoystickPosition joysticks[2];
};

enum MsgPackHidActions : u8{
    ActivateHIDEvents,
    DeactivateHIDEvents
};

enum MsgPackHidEventTypes : u8{
    ControllerAppeared,
    ControllerDisappeared,
    ControllerPowerChanged,
    ControllerKeysDown,
    ControllerKeysUp,
    ControllerJoysticksUpdate
};

enum MsgPackHidControllerKeyFlags : u32{
    A = BIT(0),
    B = BIT(1),
    X = BIT(2),
    Y = BIT(3),
    LeftStick = BIT(4),
    RightStick = BIT(5),
    L = BIT(6),
    R = BIT(7),
    ZL = BIT(8),
    ZR = BIT(9),
    Plus = BIT(10),
    Minus = BIT(11),
    LeftPad = BIT(12),
    UpPad = BIT(13),
    RightPad = BIT(14),
    DownPad = BIT(15),
    SLLeft = BIT(24),
    SRLeft = BIT(25),
    SLRight = BIT(26),
    SRRight = BIT(27),
};

enum MsgPackHidControllerColorFlags : u8{
    IsSplitted = BIT(0),
    IsSingle = BIT(1)
};

enum MsgPackHidControllerBatteryFlags : u8{
    IsCharging = BIT(0),
    IsPoweredExternally = BIT(1)
};

enum MsgPackHidControllerJoystick : u8{
    Left, Right
};

enum MsgPackHidEventKeys : u16{
    ControllerID,
    ControllerType,
    ControllerLeftColorBody,
    ControllerLeftColorButtons,
    ControllerLeftColorFlags,
    ControllerRightColorBody,
    ControllerRightColorButtons,
    ControllerRightColorFlags,
    ControllerLeftBatteryLevel,
    ControllerLeftBatteryFlags,
    ControllerRightBatteryLevel,
    ControllerRightBatteryFlags
};

class HIDSubmodule : public WebIPCHandler{
    

    WebIPCRequest* hidEventRequest;
    std::array<ControllerStatus, 8> statusOfControllers;
    std::thread thread;
    bool stop;

    void threadExec();
    static void staticThreadExec(HIDSubmodule* sub);
    
public:
    void handleRequest(WebIPCRequest* request) override;
    void activateHIDEvents(WebIPCRequest* request);
    void deactivateHIDEvents();
    HIDSubmodule();
    ~HIDSubmodule();
};