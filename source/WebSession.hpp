#pragma once

#include <vector>
#include <list>
#include <queue>
#include <tuple>
#include <memory>
#include <switch.h>
#include <mutex>
#include <thread>
#include <exception>
#include "WebSessionHandler.hpp"

#define SENDING_QUEUE_SIZE 50

class WebSessionHandler;

class WebSessionQueueCollapsed : public std::runtime_error{
public:
        WebSessionQueueCollapsed() : std::runtime_error("The sending queue is full"){}
};

class WebSession{
private:
        using PriorizedMessage = std::tuple<u8, std::vector<u8>>;

        AppletHolder* appletHolder;
        Thread thread;
        std::size_t lastMessageStorageSize;
        UEvent messageOnQueueEvent;
        std::list<std::unique_ptr<WebSessionHandler>> handlers;
        std::shared_ptr<WebSession> masterPointer;
        std::mutex messageStorageLock;
        
        static bool tupleComparator(PriorizedMessage left, PriorizedMessage right){
                return std::get<0>(left) < std::get<0>(right);
        }

        std::priority_queue<PriorizedMessage, std::vector<PriorizedMessage>, std::function<decltype(tupleComparator)>> messagesToSend;

        static void staticThreadExec(void *arg);
        void threadExec();
        void processIncomingMessage();
        void processOutcomingMessage();
        void ackIncomingMessage(u32 storageSize);

public:
        UEvent queueAvaiableEvent;

        WebSession(AppletHolder* holder);
        ~WebSession();

        void sendMessage(const std::vector<u8> &&data, u8 priority = 100);
        void addHandler(std::unique_ptr<WebSessionHandler> handler);
        void startThread();
        void waitForThread();
};