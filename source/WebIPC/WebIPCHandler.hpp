#pragma once

#include <vector>
#include <switch.h>
#include "WebIPCRequest.hpp"

class WebIPCHandler{
public:
    virtual void handleRequest(WebIPCRequest* request) = 0;
};