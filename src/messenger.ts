/* Used to obfuscate the actual type, which is determined by the Message class. */
type Handle_ID = any;

/* Individual messages, which use their own internal method of uniquely identifying their handles. */
class Message
{
    #handlers: object;
    #new_handle_id: number;

    constructor()
    {
        this.#handlers = {};
        this.#new_handle_id = 0;
    }

    async Subscribe(handler):
        Promise<Handle_ID>
    {
        if (this.#new_handle_id + 1 < this.#new_handle_id) {
            throw new Error(`Ran out of unique ids.`);
        } else {
            const handle_id = this.#new_handle_id;
            this.#new_handle_id += 1;

            this.#handlers[handle_id] = handler;

            return handle_id;
        }
    }

    async Unsubscribe(handle_id: Handle_ID):
        Promise<void>
    {
        delete this.#handlers[handle_id];
    }

    async Publish(message_data: any = null):
        Promise<Promise<void[]>>
    {
        return Promise.all(Object.values(this.#handlers).map(async function (handler)
        {
            await handler(message_data);
        }));
    }
}

/* Used to Unsubscribe through the messenger. A unique handle is returned for every subscription. */
class Handle
{
    #message_name: string;
    #handle_id: Handle_ID;

    constructor(message_name: string, handle_id: Handle_ID)
    {
        this.#message_name = message_name;
        this.#handle_id = handle_id;
    }

    Message_Name():
        string
    {
        return this.#message_name;
    }

    Handle_ID():
        Handle_ID
    {
        return this.#handle_id;
    }
}

/* A simple pub-sub, used to decouple events, event creators, and event handlers. */
export default class Messenger
{
    #messages: object;

    constructor()
    {
        this.#messages = {};
    }

    async Subscribe(message_name: string, handler: (message_data: any) => void):
        Promise<Handle>
    {
        let message = this.#messages[message_name];
        if (message == null) {
            message = new Message();
            this.#messages[message_name] = message;
        }

        return await new Handle(message_name, await message.Subscribe(handler));
    }

    async Unsubscribe(handle: Handle):
        Promise<void>
    {
        const message = this.#messages[handle.Message_Name()];
        if (message == null) {
            throw new Error(`Message by the name of "${handle.Message_Name()}" does not exist.`);
        } else {
            await message.Unsubscribe(handle.Handle_ID());
        }
    }

    async Publish(message_name: string, message_data: any = null):
        Promise<void>
    {
        const message = this.#messages[message_name];
        if (message != null) {
            await message.Publish(message_data);
        }
    }
}
