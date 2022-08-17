/* A simple pub-sub. */
export default class Messanger
{
    #messages;

    constructor()
    {
        this.#messages = {};
    }

    async Subscribe(message_name, handler)
    {
        let message = this.#messages[message_name];
        if (message == null) {
            message = new Message();
            this.#messages[message_name] = message;
        }

        return await message.Subscribe(handler);
    }

    async Unsubscribe(message_name, handle)
    {
        const message = this.#messages[message_name];
        if (message == null) {
            throw new Error(`Message by the name of "${message_name}" does not exist.`);
        } else {
            await message.Unsubscribe(handle);
        }
    }

    async Publish(message_name, data = null)
    {
        const message = this.#messages[message_name];
        if (message != null) {
            await message.Publish(data);
        }
    }
}

/* Individual messages. */
class Message
{
    #handlers;
    #new_handle;

    constructor()
    {
        // instead of an object, we could use an array with indices set to null
        // for unsubscribed handlers and a cache of the lowest free index for
        // quick subscriptions. We would just need to null check during Publish.
        this.#handlers = {};
        this.#new_handle = 0;
    }

    async Subscribe(handler)
    {
        if (this.#new_handle + 1 < this.#new_handle) {
            throw new Error(`Ran out of unique handles.`);
        } else {
            const handle = this.#new_handle;
            this.#new_handle += 1;

            this.#handlers[handle] = handler;

            return handle;
        }
    }

    async Unsubscribe(handle)
    {
        delete this.#handlers[handle];
    }

    async Publish(data = null)
    {
        for (const handler of Object.values(this.#handlers)) {
            await handler(data);
        }
    }
}
