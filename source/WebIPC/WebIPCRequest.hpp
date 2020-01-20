#pragma once

#include <string>
#include <memory>
#include <functional>
#include "../../msgpack11/msgpack11.hpp"
#include "WebIPCCoordinator.hpp"

using msgpack11::MsgPack;

class WebIPCCoordinator;

struct WebIPCRequest{
    uint32_t requestID;
    uint8_t submodule;
    uint32_t action;
    WebIPCCoordinator *returnCoordinator;
    std::function<void()> cancelRequest;
    MsgPack requestData;
};