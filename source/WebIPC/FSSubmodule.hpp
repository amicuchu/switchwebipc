#pragma once

#include "WebIPCRequest.hpp"

class WebIPCRequest;

class FSSubmodule : public WebIPCHandler{
    WebIPCRequest* hidEventRequest;

public:
    FSSubmodule();
    ~FSSubmodule();

    void handleRequest(WebIPCRequest* request) override;
};