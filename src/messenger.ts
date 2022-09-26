/* Used both to subscribe and publish events. */
export type Publisher_Name =
    string;

/* Sent to a publisher's subscriber's handlers when an event occurs. */
export type Publisher_Data =
    any;

/* Uniquely identifies a subscriber when paired with a publisher name. */
export type Subscriber_ID =
    number;

/* Used as a callback for each subscriber when an event occurs. */
export type Subscriber_Handler =
    (publisher_data: Publisher_Data) => void | Promise<void>;

/* Used when publishing an event. */
export type Publisher_Info = {
    data: Publisher_Data;
    disable_until_complete: boolean; // discards any subsequent events from this publisher until the current one completes
}

/* Used when subscribing to a publisher. */
export type Subscriber_Info = {
    handler: Subscriber_Handler;
}

/* Contains a register of subscribers which can be published to. */
class Publisher
{
    #is_enabled: boolean;
    #subscribers: { [index: Subscriber_ID]: Subscriber };
    #subscriber_count: number;
    #next_subscriber_id: number;

    constructor()
    {
        this.#is_enabled = true;
        this.#subscribers = {};
        this.#subscriber_count = 0;
        this.#next_subscriber_id = 0;
    }

    async Is_Enabled()
    {
        return this.#is_enabled;
    }

    async Enable()
    {
        this.#is_enabled = true;
    }

    async Disable()
    {
        this.#is_enabled = false;
    }

    async Subscriber_Count():
        Promise<number>
    {
        return this.#subscriber_count;
    }

    async Subscriber(subscriber_id: Subscriber_ID):
        Promise<Subscriber>
    {
        if (this.#subscribers[subscriber_id] == null) {
            throw new Error(`The subscriber_id "${subscriber_id}" does not exist on this publisher.`);
        } else {
            return this.#subscribers[subscriber_id];
        }
    }

    async Subscribe(subscriber_info: Subscriber_Info):
        Promise<Subscriber_ID>
    {
        if (this.#next_subscriber_id + 1 < this.#next_subscriber_id) {
            throw new Error(`Ran out of unique subscriber_ids.`);
        } else {
            const subscriber_id = this.#next_subscriber_id;
            this.#next_subscriber_id += 1;

            this.#subscribers[subscriber_id] = new Subscriber(subscriber_info);
            this.#subscriber_count += 1;

            return subscriber_id;
        }
    }

    async Unsubscribe(subscriber_id: Subscriber_ID):
        Promise<void>
    {
        if (this.#subscribers[subscriber_id] == null) {
            throw new Error(`The subscriber_id "${subscriber_id}" does not exist on this publisher.`);
        } else {
            delete this.#subscribers[subscriber_id];
            this.#subscriber_count -= 1;
        }
    }

    async Publish({ data = null, disable_until_complete = false }: Publisher_Info)
    {
        if (await this.Is_Enabled()) {
            const promises = Promise.all(Object.values(this.#subscribers).map(async function (subscriber: Subscriber)
            {
                await (await subscriber.Handler())(data);
            }));

            if (disable_until_complete) {
                await this.Disable();
                await promises;
                await this.Enable();

                return;
            } else {
                return promises;
            }
        }
    }
}

/* Contains relevant info and options that are used when publishing an event to a subscriber. */
class Subscriber
{
    #handler: Subscriber_Handler;

    constructor({ handler }: Subscriber_Info)
    {
        this.#handler = handler;
    }

    async Handler()
    {
        return this.#handler;
    }
}

/* A handle to a subscriber and their publisher, for the sake of unsubscribing. */
export class Subscription
{
    #publisher_name: Publisher_Name;
    #subscriber_id: Subscriber_ID;

    constructor(publisher_name: Publisher_Name, subscriber_id: Subscriber_ID)
    {
        this.#publisher_name = publisher_name;
        this.#subscriber_id = subscriber_id;
    }

    async Publisher_Name():
        Promise<Publisher_Name>
    {
        return this.#publisher_name;
    }

    async Subscriber_ID():
        Promise<Subscriber_ID>
    {
        return this.#subscriber_id;
    }
}

/* Used to decouple events, event creators, and event handlers, using the pub-sub pattern. */
export class Messenger
{
    #publishers: { [index: Publisher_Name]: Publisher };

    constructor()
    {
        this.#publishers = {};
    }

    async Subscribe(publisher_name: Publisher_Name, subscriber_info: Subscriber_Info):
        Promise<Subscription>
    {
        let publisher = this.#publishers[publisher_name];
        if (publisher == null) {
            publisher = new Publisher();
            this.#publishers[publisher_name] = publisher;
        }

        return new Subscription(publisher_name, await publisher.Subscribe(subscriber_info));
    }

    async Unsubscribe(subscription: Subscription):
        Promise<void>
    {
        const publisher = this.#publishers[await subscription.Publisher_Name()];
        if (publisher == null) {
            throw new Error(`Publisher by the name of "${await subscription.Publisher_Name()}" does not exist.`);
        } else {
            await publisher.Unsubscribe(await subscription.Subscriber_ID());
        }
    }

    async Publish(publisher_name: Publisher_Name, publisher_info: Publisher_Info):
        Promise<void>
    {
        const publisher = this.#publishers[publisher_name];
        if (publisher != null) {
            await publisher.Publish(publisher_info);
        }
    }
}
