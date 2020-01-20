#include "WebSession.hpp"
#include "Log.hpp"
#include <cstring>

struct PACKED SessionMessageHeader{
    unsigned int messageID;
    u32 size;
    u64 pad;
};

struct PACKED AckData{
    u32 ackedSize;
    u32 whatever;
    u32 reserved;
};

void fillPopInteractiveOutDataEvent(AppletHolder *holder){
    Handle tmp_handle = INVALID_HANDLE;
    Result rc = 1;

    while(R_FAILED(rc)){
        serviceAssumeDomain(&holder->s);
        rc = serviceDispatch(&holder->s, 106,
            .out_handle_attrs = { SfOutHandleAttr_HipcCopy },
            .out_handles = &tmp_handle,
        );
        if(R_FAILED(rc)) svcSleepThread(5000000);
    }
    
    eventLoadRemote(&holder->PopInteractiveOutDataEvent, tmp_handle, false);
    
}

WebSession::WebSession(AppletHolder* holder) :
    messagesToSend{WebSession::tupleComparator, std::vector<PriorizedMessage>{SENDING_QUEUE_SIZE}}
{
    handlers = std::list<std::unique_ptr<WebSessionHandler>>();
    this->appletHolder = holder;
    masterPointer = std::shared_ptr<WebSession>(this);
    Result rc = threadCreate(&this->thread, &WebSession::staticThreadExec, this, nullptr, 0x10000, 0x2C, -2);
    g_Logger.print("Thread created");
    if(R_FAILED(rc)){
        throw rc;
    }

    ueventCreate(&this->messageOnQueueEvent, false);
    ueventCreate(&this->queueAvaiableEvent, false);
    ueventSignal(&this->queueAvaiableEvent);
}

WebSession::~WebSession(){
    threadClose(&this->thread);
}

void WebSession::sendMessage(const std::vector<u8> &&data, u8 priority){
    std::scoped_lock<std::mutex> scLock{messageStorageLock};
    if(messagesToSend.size() == SENDING_QUEUE_SIZE){
        throw WebSessionQueueCollapsed{};
    }else if(messagesToSend.size() == SENDING_QUEUE_SIZE - 1){
        ueventClear(&queueAvaiableEvent);
    }
    messagesToSend.push(std::make_tuple(priority,std::forward<const std::vector<u8>>(data)));
    ueventSignal(&messageOnQueueEvent);
}

void WebSession::addHandler(std::unique_ptr<WebSessionHandler> handler){
    handler->giveWebSession(std::weak_ptr<WebSession>(masterPointer));
    handlers.push_back(std::move(handler));
}

void WebSession::startThread(){
    Result rc = threadStart(&this->thread);
    g_Logger.print("Thread started");
    if(R_FAILED(rc)){
        throw rc;
    }
}

void WebSession::waitForThread(){
    Result rc = threadWaitForExit(&this->thread);
    if(R_FAILED(rc)){
        g_Logger.print("Thread wait failed: " + rc);
        throw rc;
    }
}

void WebSession::staticThreadExec(void* arg){
    auto webSession = reinterpret_cast<WebSession*>(arg);
    //g_Logger.print("Static thread trampolin");
    try{
        webSession->threadExec();
    }catch(Result rc){
        g_Logger.print("NX error code: " + std::to_string(rc));
    }catch(...){
        g_Logger.print("Unknown exception");
    }
}

void WebSession::threadExec(){
    svcSleepThread(5000000000);
    //g_Logger.print("Web session thread");
    fillPopInteractiveOutDataEvent(appletHolder);
    //From here, logging should not crash
    g_Logger.print("PopInteractiveOutDataEvent getted");

    while(true){
        s32 selectedWaiter;
        Result rc;

        if(this->lastMessageStorageSize == 0){
            const Waiter waiters[] = {
                waiterForEvent(&this->appletHolder->PopInteractiveOutDataEvent),
                waiterForEvent(&this->appletHolder->StateChangedEvent),
                waiterForUEvent(&this->messageOnQueueEvent)
            };
            rc = waitObjects(&selectedWaiter, waiters, sizeof(waiters) / sizeof(Waiter), U64_MAX);
        }else{
            const Waiter waiters[] = {
                waiterForEvent(&this->appletHolder->PopInteractiveOutDataEvent),
                waiterForEvent(&this->appletHolder->StateChangedEvent)
            };
            rc = waitObjects(&selectedWaiter, waiters, sizeof(waiters) / sizeof(Waiter), U64_MAX);
        }
        
        if(rc == KERNELRESULT(TimedOut)){
            continue;
        }else if(R_FAILED(rc)){
            throw rc;
        }

        switch (selectedWaiter) {
        case 0:
            g_Logger.print("WebSession: Data incoming");
            //Interactive data avaiable
            processIncomingMessage();
            break;
        case 1:
            g_Logger.print("WebSession: AppletHolder status changed");
            //Applet holder state changed
            return;
        case 2:
            g_Logger.print("WebSession: Sending message");
            //Message on queue
            processOutcomingMessage();
            break;
        default:
            break;
        }
    }
}

void WebSession::processIncomingMessage(){
    AppletStorage storage;
    Result rc = appletHolderPopInteractiveOutData(this->appletHolder, &storage);
    if(R_FAILED(rc)){
        throw rc;
    }

    s64 size;
    rc = appletStorageGetSize(&storage, &size);
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }

    std::vector<u8> buffer(size);
    appletStorageRead(&storage, 0, buffer.data(), size);
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }

    g_Logger.printBuffer(buffer);

    struct SessionMessageHeader* header = reinterpret_cast<struct SessionMessageHeader*>(buffer.data());
    if(header->messageID == 0x1000){
        //Ack
        struct AckData* ack = reinterpret_cast<struct AckData*>(buffer.data() + sizeof(*header));
        if(ack->ackedSize == this->lastMessageStorageSize){
            this->lastMessageStorageSize = 0;
            processOutcomingMessage();
        }else{
            appletStorageClose(&storage);
            throw "Ack mismatch";
        }
    }else if(header->messageID == 0){
        //Message to receive
        std::vector<u8> data(buffer.cbegin() + sizeof(*header), buffer.cbegin() + sizeof(*header) + header->size);

        g_Logger.print("WebSession: Broadcasting to handlers");

        for(const auto& handler : handlers){
            handler->handleMessage(data);
        }

        std::string dataDec(reinterpret_cast<char*>(data.data()), data.size() - 1);
        g_Logger.print(dataDec);

        ackIncomingMessage(header->size);
    }

    appletStorageClose(&storage);
}

void WebSession::ackIncomingMessage(u32 storageSizeToAck){
    g_Logger.print("WebSession: Acking message received");
    
    struct SessionMessageHeader header{
        .messageID = 0x1000,
        .size = sizeof(struct AckData),
        .pad = 0
    };

    struct AckData data{
        .ackedSize = storageSizeToAck,
        .whatever = 0,
        .reserved = 0
    };

    const u32 lastWord = 0;

    AppletStorage storage;
    Result rc;

    rc = appletCreateStorage(&storage, sizeof(header) + sizeof(data) + sizeof(u32));
    if(R_FAILED(rc)){
        throw rc;
    }

    rc = appletStorageWrite(&storage, 0, &header, sizeof(header));
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }

    rc = appletStorageWrite(&storage, sizeof(header), &data, sizeof(data));
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }

    rc = appletStorageWrite(&storage, sizeof(header) + sizeof(data), &lastWord, sizeof(lastWord));
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }

    rc = appletHolderPushInteractiveInData(appletHolder, &storage);
    if(R_FAILED(rc)){
        appletStorageClose(&storage);
        throw rc;
    }
}

void WebSession::processOutcomingMessage(){
    if(!this->messagesToSend.empty()){
        std::vector<u8> buffer;
        {
            std::scoped_lock<std::mutex> scLock{messageStorageLock};
            buffer = std::move(std::get<1>(messagesToSend.top()));
            messagesToSend.pop();
        }
        ueventSignal(&queueAvaiableEvent);

        struct SessionMessageHeader header {
            .messageID = 0x0,
            .size = static_cast<u32>(buffer.size()),
            .pad = 0
        };

        g_Logger.printBuffer(buffer);

        AppletStorage storage;
        Result rc = appletCreateStorage(&storage, sizeof(header) + buffer.size());
        if(R_FAILED(rc)){
            throw rc;
        }

        rc = appletStorageWrite(&storage, 0, &header, sizeof(header));
        if(R_FAILED(rc)){
            throw rc;
        }

        rc = appletStorageWrite(&storage, sizeof(header), buffer.data(), buffer.size());
        if(R_FAILED(rc)){
            throw rc;
        }

        rc = appletHolderPushInteractiveInData(appletHolder, &storage);
        if(R_FAILED(rc)){
            appletStorageClose(&storage);
            throw rc;
        }
        this->lastMessageStorageSize = sizeof(header) + buffer.size();
    }else{
        ueventClear(&this->messageOnQueueEvent);
    }
}