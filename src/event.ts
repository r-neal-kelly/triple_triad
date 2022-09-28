import * as Messenger from "./messenger";

export const BEFORE: Messenger.Publisher_Name = `Before`;
export const ON: Messenger.Publisher_Name = `On`;
export const AFTER: Messenger.Publisher_Name = `After`;

export class Name
{
    #prefix: string;
    #affix: string;
    #suffix: string;

    constructor(
        prefix: string,
        affix: string,
        suffix?: string | null,
    )
    {
        if (prefix !== BEFORE &&
            prefix !== ON &&
            prefix !== AFTER) {
            throw new Error(`The 'prefix' must be '${BEFORE}', '${ON}', or '${AFTER}'.`);
        } else if (affix.length < 1) {
            throw new Error(`The 'affix' must not be an empty string.`);
        } else {
            this.#prefix = prefix;
            this.#affix = affix;
            this.#suffix = suffix != null ? suffix : ``;
        }
    }

    As_String():
        string
    {
        return `${this.#prefix}_${this.#affix}_${this.#suffix}`;
    }
}

export type Data =
    Messenger.Publisher_Data;

export class Instance
{
    #messenger: Messenger.Instance;
    #name_affix: string;
    #name_suffixes: Array<string>;
    #data: Data;
    #is_atomic: boolean;

    #is_started: boolean;
    #is_stopped: boolean;

    constructor({
        messenger,
        name_affix,
        name_suffixes = [],
        data = {},
        is_atomic = true,
    }: {
        messenger: Messenger.Instance,
        name_affix: string,
        name_suffixes?: Array<string>,
        data?: Data,
        is_atomic?: boolean,
    })
    {
        if (data.event != null) {
            throw new Error(`'data' contains a property called 'event' which will be overridden.`);
        } else {
            data.event = this;

            this.#messenger = messenger;
            this.#name_affix = name_affix;
            this.#name_suffixes = Array.from(name_suffixes);
            this.#data = Object.freeze(data);
            this.#is_atomic = is_atomic;

            this.#is_started = false;
            this.#is_stopped = false;
        }
    }

    async Messenger():
        Promise<Messenger.Instance>
    {
        return this.#messenger;
    }

    async Names():
        Promise<Array<Name>>
    {
        return [];
    }

    async Data():
        Promise<Data>
    {
        return this.#data;
    }

    async Start():
        Promise<void>
    {
        if (this.#is_started) {
            throw new Error(`This event has already been started.`);
        } else {
            const publisher_info = Object.freeze({
                data: this.#data,
                disable_until_complete: this.#is_atomic,
            });

            for (const name_prefix of [BEFORE, ON, AFTER]) {
                if (!this.#is_stopped) {
                    const promises: Array<Promise<void>> = this.#name_suffixes.map(function (
                        this: Instance,
                        name_suffix: string,
                    ):
                        Promise<void>
                    {
                        return this.#messenger.Publish(
                            new Name(name_prefix, this.#name_affix, name_suffix).As_String(),
                            publisher_info,
                        );
                    }, this);
                    promises.push(
                        this.#messenger.Publish(
                            new Name(name_prefix, this.#name_affix).As_String(),
                            publisher_info,
                        ),
                    );
                    await Promise.all(promises);
                }
            }
        }
    }

    /* Stops the succeeding waves of the event, i.e. if on the 'Before' wave if this is called, 'On' and 'After' waves are stopped. */
    async Stop():
        Promise<void>
    {
        this.#is_stopped = true;
    }
}

export type Listener_Info = {
    event_name: Name,
    handler: Listener_Handler,
};

export type Listener_Handler =
    Messenger.Subscriber_Handler;

export class Listener
{
    #info: Listener_Info;
    #subscription: Messenger.Subscription;

    constructor({
        info,
        subscription,
    }: {
        info: Listener_Info,
        subscription: Messenger.Subscription,
    })
    {
        this.#info = Object.freeze(info);
        this.#subscription = subscription;
    }

    Event_Name():
        Name
    {
        return this.#info.event_name;
    }

    Handler():
        Listener_Handler
    {
        return this.#info.handler;
    }

    Subscription():
        Messenger.Subscription
    {
        return this.#subscription;
    }
}

export class Node
{
    #this_owner: any;
    #messenger: Messenger.Instance;
    #listeners: Array<Listener>;

    constructor(
        this_owner: any,
        messenger: Messenger.Instance,
    )
    {
        this.#this_owner = this_owner;
        this.#messenger = messenger;
        this.#listeners = [];
    }

    async Add_Listener(listener_info: Listener_Info):
        Promise<Listener>
    {
        const listener: Listener = new Listener({
            info: listener_info,
            subscription: await this.#messenger.Subscribe(
                listener_info.event_name.As_String(),
                {
                    handler: listener_info.handler.bind(this.#this_owner),
                },
            )
        });

        this.#listeners.push(listener);

        return listener;
    }

    async Add_Listeners(
        listener_infos: Array<Listener_Info>,
    ):
        Promise<Array<Listener>>
    {
        const listeners: Array<Listener> = [];

        await Promise.all(listener_infos.map(async function (
            this: Node,
            listener_info: Listener_Info,
        ):
            Promise<void>
        {
            listeners.push(await this.Add_Listener(listener_info));
        }, this));

        return listeners;
    }

    async Remove_Listener(listener: Listener):
        Promise<void>
    {

    }

    async Remove_All_Listeners():
        Promise<void>
    {
        await Promise.all(Object.values(this.#listeners).map(function (
            this: Node,
            listener: Listener,
        ):
            Promise<void>
        {
            return this.#messenger.Unsubscribe(listener.Subscription());
        }, this));
    }

    async Send({
        event_name_affix,
        event_name_suffixes = [],
        event_data = {},
        is_atomic = true,
    }: {
        event_name_affix: string,
        event_name_suffixes?: Array<string>,
        event_data?: Data,
        is_atomic?: boolean,
    }):
        Promise<void>
    {
        await new Instance({
            messenger: this.#messenger,
            name_affix: event_name_affix,
            name_suffixes: event_name_suffixes,
            data: event_data,
            is_atomic: is_atomic,
        }).Start();
    }
}
