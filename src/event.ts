import * as Messenger from "./messenger";

export const BEFORE: Name_Part = `Before`;
export const ON: Name_Part = `On`;
export const AFTER: Name_Part = `After`;

export class Grid
{
    #messenger: Messenger.Instance;
    #objects: Map<Object, Listeners>;

    constructor()
    {
        this.#messenger = new Messenger.Instance();
        this.#objects = new Map();
    }

    Has(object: Object):
        boolean
    {
        return this.#objects.has(object);
    }

    Add(object: Object):
        void
    {
        if (this.Has(object)) {
            throw new Error(`This 'object' is already in the grid and cannot be added again.`);
        } else {
            this.#objects.set(object, new Listeners());
        }
    }

    Add_Many(objects: Array<Object>):
        void
    {
        for (const object of objects) {
            this.Add(object);
        }
    }

    async Remove(object: Object):
        Promise<void>
    {
        if (!this.Has(object)) {
            throw new Error(`This 'object' is not in the grid and thus cannot be removed.`);
        } else {
            await this.Remove_All_Listeners(object);
            this.#objects.delete(object);
        }
    }

    async Remove_Many(objects: Array<Object>):
        Promise<void>
    {
        await Promise.all(objects.map(async function (
            this: Grid,
            object: Object,
        ):
            Promise<void>
        {
            await this.Remove(object);
        }, this));
    }

    async Remove_All():
        Promise<void>
    {
        const promises: Array<Promise<void>> = [];
        for (const object of this.#objects.keys()) {
            promises.push(this.Remove(object));
        }
        await Promise.all(promises);
    }

    #Some_Listeners(object: Object):
        Listeners
    {
        if (!this.Has(object)) {
            throw new Error(`This 'object' is not in the grid.`);
        } else {
            return this.#objects.get(object) as Listeners;
        }
    }

    Has_Listener(
        object: Object,
        listener_handle: Listener_Handle,
    ):
        boolean
    {
        return this.#Some_Listeners(object).Has(listener_handle);
    }

    async Add_Listener(
        object: Object,
        listener_info: Listener_Info,
    ):
        Promise<Listener_Handle>
    {
        return this.#Some_Listeners(object).Add({
            object: object,
            listener_info: listener_info,
            messenger: this.#messenger,
        });
    }

    async Add_Many_Listeners(
        object: Object,
        listener_infos: Array<Listener_Info>,
    ):
        Promise<Array<Listener_Handle>>
    {
        return this.#Some_Listeners(object).Add_Many({
            object: object,
            listener_infos: listener_infos,
            messenger: this.#messenger,
        });
    }

    async Remove_Listener(
        object: Object,
        listener_handle: Listener_Handle,
    ):
        Promise<void>
    {
        await this.#Some_Listeners(object).Remove({
            listener_handle: listener_handle,
            messenger: this.#messenger,
        });
    }

    async Remove_Many_Listeners(
        object: Object,
        listener_handles: Array<Listener_Handle>,
    ):
        Promise<void>
    {
        await this.#Some_Listeners(object).Remove_Many({
            listener_handles: listener_handles,
            messenger: this.#messenger,
        });
    }

    async Remove_All_Listeners(
        object: Object,
    ):
        Promise<void>
    {
        await this.#Some_Listeners(object).Remove_All({
            messenger: this.#messenger,
        });
    }

    async Send_Event(event_info: Info):
        Promise<void>
    {
        await new Instance(this.#messenger, event_info).Start();
    }
};

class Listeners
{
    #listener_handles: Set<Listener_Handle>;

    constructor()
    {
        this.#listener_handles = new Set();
    }

    Has(listener_handle: Listener_Handle):
        boolean
    {
        return this.#listener_handles.has(listener_handle);
    }

    async Add({
        object,
        listener_info,
        messenger,
    }: {
        object: Object,
        listener_info: Listener_Info,
        messenger: Messenger.Instance,
    }):
        Promise<Listener_Handle>
    {
        const listener_handle: Listener_Handle = await messenger.Subscribe(
            listener_info.event_name.As_String(),
            {
                handler: listener_info.event_handler.bind(object),
            } as Messenger.Subscriber_Info,
        );
        this.#listener_handles.add(listener_handle);

        return listener_handle;
    }

    async Add_Many({
        object,
        listener_infos,
        messenger,
    }: {
        object: Object,
        listener_infos: Array<Listener_Info>,
        messenger: Messenger.Instance,
    }):
        Promise<Array<Listener_Handle>>
    {
        const listener_handles: Array<Listener_Handle> = [];
        await Promise.all(listener_infos.map(async function (
            this: Listeners,
            listener_info: Listener_Info,
        ):
            Promise<void>
        {
            listener_handles.push(await this.Add({
                object,
                listener_info,
                messenger,
            }));
        }, this));

        return listener_handles;
    }

    async Remove({
        listener_handle,
        messenger,
    }: {
        listener_handle: Listener_Handle,
        messenger: Messenger.Instance,
    }):
        Promise<void>
    {
        await messenger.Unsubscribe(listener_handle);
        this.#listener_handles.delete(listener_handle);
    }

    async Remove_Many({
        listener_handles,
        messenger,
    }: {
        listener_handles: Array<Listener_Handle>,
        messenger: Messenger.Instance,
    }):
        Promise<void>
    {
        await Promise.all(listener_handles.map(async function (
            this: Listeners,
            listener_handle: Listener_Handle,
        ):
            Promise<void>
        {
            await this.Remove({
                listener_handle,
                messenger,
            });
        }, this));
    }

    async Remove_All({
        messenger,
    }: {
        messenger: Messenger.Instance,
    }):
        Promise<void>
    {
        const promises: Array<Promise<void>> = [];
        for (const listener_handle of this.#listener_handles.values()) {
            promises.push(this.Remove({
                listener_handle,
                messenger,
            }));
        }
        await Promise.all(promises);
    }
};

export type Listener_Info = {
    event_name: Name,
    event_handler: Handler,
};

export type Handler =
    Messenger.Subscriber_Handler;

export type Listener_Handle =
    Messenger.Subscription;

export type Name_Part =
    string;

export class Name
{
    #string: string;

    static #Has_Dangling_Underscore(string: string):
        boolean
    {
        return string.length > 0 && (string[0] === `_` || string[string.length - 1] === `_`);
    }

    constructor(
        prefix: Name_Part,
        affix: Name_Part,
        suffix?: Name_Part | null,
    )
    {
        if (prefix !== BEFORE &&
            prefix !== ON &&
            prefix !== AFTER) {
            throw new Error(`The 'prefix' must be '${BEFORE}', '${ON}', or '${AFTER}'.`);
        } else if (affix.length < 1) {
            throw new Error(`The 'affix' must have at least one character.`);
        } else if (Name.#Has_Dangling_Underscore(affix)) {
            throw new Error(`The 'affix' cannot have a dangling '_' on the beginning or end of the string.`);
        } else if (suffix != null && suffix.length < 1) {
            throw new Error(`The 'suffix' must either be null or a string with at least one character.`);
        } else if (suffix != null && Name.#Has_Dangling_Underscore(suffix)) {
            throw new Error(`The 'suffix' cannot have a dangling '_' on the beginning or end of the string.`);
        } else {
            if (suffix != null) {
                this.#string = `${prefix}_${affix}_${suffix}`;
            } else {
                this.#string = `${prefix}_${affix}`;
            }
        }
    }

    As_String():
        string
    {
        return this.#string;
    }
};

export type Info = {
    name_affix: Name_Part,
    name_suffixes?: Array<Name_Part>,
    data?: Data,
    is_atomic?: boolean,
};

export type Data =
    Object;

class Instance
{
    #messenger: Messenger.Instance;
    #name_affix: Name_Part;
    #name_suffixes: Array<Name_Part>;
    #data: Data;
    #is_atomic: boolean;

    #is_started: boolean;
    #is_stopped: boolean;

    constructor(
        messenger: Messenger.Instance,
        {
            name_affix,
            name_suffixes = [],
            data = {},
            is_atomic = true,
        }: Info,
    )
    {
        if ((data as any)["event"] != null) {
            throw new Error(`'data' contains a property called 'event' which will be overridden.`);
        } else if (Object.isFrozen(data)) {
            throw new Error(`'data' must not be frozen in order to add this event to it. It will then be frozen for you.`);
        } else {
            (data as any)["event"] = this;

            this.#messenger = messenger;
            this.#name_affix = name_affix;
            this.#name_suffixes = Array.from(name_suffixes);
            this.#data = Object.freeze(data);
            this.#is_atomic = is_atomic;

            this.#is_started = false;
            this.#is_stopped = false;
        }
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
                    const promises: Array<Promise<void>> = this.#name_suffixes.map(async function (
                        this: Instance,
                        name_suffix: Name_Part,
                    ):
                        Promise<void>
                    {
                        await this.#messenger.Publish(
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
};
export type { Instance };
