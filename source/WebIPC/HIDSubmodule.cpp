#include <switch.h>
#include "HIDSubmodule.hpp"
#include <chrono>

inline MsgPack packControllerBatteryFlags(const HidPowerInfo &powerInfo){
    return MsgPack{
        static_cast<u32>(powerInfo.isCharging) << MsgPackHidControllerBatteryFlags::IsCharging |
        static_cast<u32>(powerInfo.powerConnected) << MsgPackHidControllerBatteryFlags::IsPoweredExternally
    };
}

inline void sendMessageForKey(const MsgPackHidEventTypes evType, WebIPCRequest* request, u8 hidControllerID,
                              const u64 keys, const u64 keyToDetect, const MsgPackHidControllerKeyFlags packKey){
    if(keys & keyToDetect){
        request->returnCoordinator->answerRequest(
            request->requestID, 
            MsgPack::array{MsgPack{evType}, MsgPack{hidControllerID}, MsgPack{static_cast<u32>(packKey)}},
            false
        );
    }
}

inline void sendMessageForKeys(const MsgPackHidEventTypes evType, WebIPCRequest* request, u8 hidControllerID, const u64 keys){
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_A, MsgPackHidControllerKeyFlags::A);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_B, MsgPackHidControllerKeyFlags::B);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_X, MsgPackHidControllerKeyFlags::X);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_Y, MsgPackHidControllerKeyFlags::Y);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_LSTICK, MsgPackHidControllerKeyFlags::LeftStick);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_RSTICK, MsgPackHidControllerKeyFlags::RightStick);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_L, MsgPackHidControllerKeyFlags::L);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_R, MsgPackHidControllerKeyFlags::R);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_ZL, MsgPackHidControllerKeyFlags::ZL);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_ZR, MsgPackHidControllerKeyFlags::ZR);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_PLUS, MsgPackHidControllerKeyFlags::Plus);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_MINUS, MsgPackHidControllerKeyFlags::Minus);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_DLEFT, MsgPackHidControllerKeyFlags::LeftPad);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_DUP, MsgPackHidControllerKeyFlags::UpPad);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_DRIGHT, MsgPackHidControllerKeyFlags::RightPad);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_DDOWN, MsgPackHidControllerKeyFlags::DownPad);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_SL_LEFT, MsgPackHidControllerKeyFlags::SLLeft);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_SR_LEFT, MsgPackHidControllerKeyFlags::SRLeft);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_SL_RIGHT, MsgPackHidControllerKeyFlags::SLRight);
    sendMessageForKey(evType, request, hidControllerID, keys, HidControllerKeys::KEY_SR_RIGHT, MsgPackHidControllerKeyFlags::SRRight);
}


void HIDSubmodule::threadExec(){
    while(!stop){
        hidScanInput();

        for(unsigned int i = 0; i < statusOfControllers.size(); i++){
            ControllerStatus &currentStatusController = statusOfControllers[i];
            bool connected = hidIsControllerConnected(static_cast<HidControllerID>(i));
            if(connected != statusOfControllers[i].connected){
                MsgPack::object packData = MsgPack::object{{MsgPackHidEventKeys::ControllerID, MsgPack{static_cast<u8>(i)}}};

                if(connected){
                    currentStatusController.type = hidGetControllerType(static_cast<HidControllerID>(i));
                    packData[MsgPack{MsgPackHidEventKeys::ControllerType}] = MsgPack{currentStatusController.type};

                    HidControllerColors colors;
                    hidGetControllerColors(static_cast<HidControllerID>(i), &colors);
                    packData[MsgPack{MsgPackHidEventKeys::ControllerLeftColorBody}] = MsgPack{colors.leftColorBody};
                    packData[MsgPack{MsgPackHidEventKeys::ControllerLeftColorButtons}] = MsgPack{colors.leftColorButtons};
                    packData[MsgPack{MsgPackHidEventKeys::ControllerRightColorBody}] = MsgPack{colors.rightColorBody};
                    packData[MsgPack{MsgPackHidEventKeys::ControllerRightColorButtons}] = MsgPack{colors.rightColorButtons};

                    hidGetControllerPowerInfo(static_cast<HidControllerID>(i), currentStatusController.battery, 2);
                    packData[MsgPack{MsgPackHidEventKeys::ControllerLeftBatteryLevel}] = MsgPack{currentStatusController.battery[0].batteryCharge};
                    packData[MsgPack{MsgPackHidEventKeys::ControllerLeftBatteryFlags}] = packControllerBatteryFlags(currentStatusController.battery[0]);
                    packData[MsgPack{MsgPackHidEventKeys::ControllerRightBatteryLevel}] = MsgPack{currentStatusController.battery[1].batteryCharge};
                    packData[MsgPack{MsgPackHidEventKeys::ControllerRightBatteryFlags}] = packControllerBatteryFlags(currentStatusController.battery[1]);
                }

                hidEventRequest->returnCoordinator->answerRequest(
                    hidEventRequest->requestID, 
                    MsgPack::array{MsgPack{ connected ? MsgPackHidEventTypes::ControllerAppeared : MsgPackHidEventTypes::ControllerDisappeared}, packData},
                    false
                );
                statusOfControllers[i].connected = connected;
            }else{
                MsgPack::object packData{};
                HidPowerInfo powerInfo[2];
                hidGetControllerPowerInfo(static_cast<HidControllerID>(i), powerInfo, 2);
                
                for(u8 y=0; y<2; y++){
                    if(powerInfo[0].batteryCharge != currentStatusController.battery[0].batteryCharge){
                        currentStatusController.battery[y].batteryCharge = powerInfo[0].batteryCharge;
                        packData[MsgPack{MsgPackHidEventKeys::ControllerLeftBatteryLevel}] = MsgPack{currentStatusController.battery[y].batteryCharge};
                    }

                    if(powerInfo[y].batteryCharge != currentStatusController.battery[y].isCharging ||
                       powerInfo[y].powerConnected != currentStatusController.battery[y].powerConnected){
                        currentStatusController.battery[y] = powerInfo[y];
                        packData[MsgPack{ 
                            y==0 ? MsgPackHidEventKeys::ControllerLeftBatteryFlags : MsgPackHidEventKeys::ControllerRightBatteryFlags
                        }] = packControllerBatteryFlags(powerInfo[y]);
                    }
                }

                if(!packData.empty()){
                    packData[MsgPack{MsgPackHidEventKeys::ControllerID}] = MsgPack{static_cast<u8>(i)};
                    hidEventRequest->returnCoordinator->answerRequest(
                        hidEventRequest->requestID, 
                        MsgPack::array{MsgPack{MsgPackHidEventTypes::ControllerPowerChanged}, packData},
                        false
                    );
                }
            }
            
            u64 keys = hidKeysDown(static_cast<HidControllerID>(i));
            sendMessageForKeys(MsgPackHidEventTypes::ControllerKeysDown, hidEventRequest, i, keys);
            keys = hidKeysUp(static_cast<HidControllerID>(i));
            sendMessageForKeys(MsgPackHidEventTypes::ControllerKeysUp, hidEventRequest, i, keys);

            JoystickPosition joyPos;
            for(u8 y=0; y<2; y++){
                hidJoystickRead(
                    &joyPos,
                    static_cast<HidControllerID>(i),
                    y==0 ? HidControllerJoystick::JOYSTICK_LEFT : HidControllerJoystick::JOYSTICK_RIGHT
                );
                if(joyPos.dx != currentStatusController.joysticks[y].dx ||
                   joyPos.dy != currentStatusController.joysticks[y].dy){
                    hidEventRequest->returnCoordinator->answerRequest(
                        hidEventRequest->requestID, 
                        MsgPack::array{
                            MsgPack{MsgPackHidEventTypes::ControllerJoysticksUpdate},
                            MsgPack{static_cast<u32>(i)},
                            MsgPack{ y==0 ? MsgPackHidControllerJoystick::Left : MsgPackHidControllerJoystick::Right},
                            MsgPack{joyPos.dx}, MsgPack{joyPos.dy}
                        },
                        false
                    );
                    currentStatusController.joysticks[y] = joyPos;
                }
            }
            
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds{10});
    }

    hidEventRequest->returnCoordinator->answerRequest(hidEventRequest->requestID, MsgPack{nullptr}, true);

    stop = false;
}

HIDSubmodule::HIDSubmodule() :
    statusOfControllers(), thread(),
    stop(false){
    
}

HIDSubmodule::~HIDSubmodule() {
    if(thread.joinable()){
        stop = true;
        thread.join();
    }
}

void HIDSubmodule::handleRequest(WebIPCRequest* request){
    if(request->action == MsgPackHidActions::ActivateHIDEvents){
        activateHIDEvents(request);
    }else if(request->action == MsgPackHidActions::DeactivateHIDEvents){
        deactivateHIDEvents();
    }else{
        throw "Unknown action";
    }
}

void HIDSubmodule::activateHIDEvents(WebIPCRequest* request){
    hidEventRequest = request;
    thread = std::thread(std::bind(&HIDSubmodule::threadExec, this));
    request->cancelRequest = std::bind(&HIDSubmodule::deactivateHIDEvents, this);
}

void HIDSubmodule::deactivateHIDEvents(){
    hidEventRequest = nullptr;
    stop = true;
    thread.join();
    thread = std::thread();
}