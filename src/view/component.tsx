import React from "react";
import ReactDom from "react-dom";

import { Wait } from "../utils";
import * as Event from "../event";

/*
    Must be satisfied to inherit from Component.
*/
export interface Component_Props
{
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

/*
    A simplification of the React life-cycle.
    Allows for all async event handlers, including
    for On_Render() which replaces render().

    Method Overrides/Event Handlers in the Life-Cycle:
        Before_Mount
            Before_Add_Listeners
            On_Add_Listeners
            After_Add_Listeners

            Before_Render
            On_Render
            After_Render
        After_Mount

        Before_Update
            Before_Render
            On_Render
            After_Render
        After_Update

        Before_Unmount
            Before_Remove_Listeners
            After_Remove_Listeners
        After_Unmount

    Each method can be overridden by a derived class.

    Is_Mounting is true during Before_Mount and After_Mount.
    Is_Updating is true during Before_Update and After_Update.
    Is_Unmounting is true during Before_Unmount and After_Unmount.

    It's safe to call Update() during Listener events or even other updates.
    Using async calls, it's now easy to set up a simple loop of updates.
*/
export class Component<T extends Component_Props> extends React.Component<T>
{
    private is_locked: boolean = false;
    private is_mounted: boolean = false;

    private renderable: JSX.Element | null = null;
    private element: HTMLElement | null = null;

    private was_component_did_mount_called: boolean = false;
    private was_render_called: boolean = false;
    private was_component_did_update_called: boolean = false;
    private was_component_will_unmount_called: boolean = false;

    constructor(props: T)
    {
        super(props);

        this.Mount();
    }

    Model():
        typeof this.props.model
    {
        return this.props.model;
    }

    Parent():
        typeof this.props.parent
    {
        return this.props.parent;
    }

    Event_Grid():
        Event.Grid
    {
        return this.props.event_grid;
    }

    Element():
        HTMLElement | null
    {
        return this.element as HTMLElement;
    }

    Error_Not_Rendered():
        Error
    {
        return new Error(`Component is not rendered.`);
    }

    Is_Locked():
        boolean
    {
        return this.is_locked;
    }

    Is_Unlocked():
        boolean
    {
        return !this.is_locked;
    }

    /*
        Locks both the async frame that calls it and
        every other frame after it until Unlock is called.
    */
    async Lock():
        Promise<void>
    {
        while (this.Is_Locked()) {
            await Wait(1);
        }

        this.is_locked = true;
    }

    /*
        Locks just the async frame that calls it.
        Does not require an Unlock call. Can still
        call Lock afterward to fully lock without any
        real penalty to efficiency, but will then require
        a call to Unlock.
    */
    async Lock_Frame():
        Promise<void>
    {
        while (this.Is_Locked()) {
            await Wait(1);
        }
    }

    Unlock():
        void
    {
        this.is_locked = false;
    }

    Is_Mounted():
        boolean
    {
        return this.is_mounted;
    }

    Is_Unmounted():
        boolean
    {
        return !this.is_mounted;
    }

    // not sure this is useful, because it can't be called during mount, update, or unmount cycles,
    // however it should be safe during any other events, I think, that is with listeners
    async Is_Ready():
        Promise<boolean>
    {
        await this.Lock_Frame();

        return this.Is_Mounted();
    }

    /* Events */
    async Send(event_info: Event.Info):
        Promise<void>
    {
        await this.Event_Grid().Send_Event(event_info);
    }

    private async Mount():
        Promise<void>
    {
        await this.Lock();
        try {
            if (this.Is_Mounted()) {
                throw new Error(`This component is already mounted.`);
            } else {
                await this.Before_Mount();
                {
                    await this.Before_Add_Listeners();
                    this.Event_Grid().Add(this);
                    this.Event_Grid().Add_Many_Listeners(this, await this.On_Add_Listeners());
                    await this.After_Add_Listeners();

                    await this.Render_();

                    while (this.was_component_did_mount_called === false) {
                        await Wait(1);
                    }

                    if (this.was_component_will_unmount_called === false) {
                        this.element = ReactDom.findDOMNode(this) as HTMLElement;
                    } else {
                        this.element = null;
                    }
                }
                await this.After_Mount();

                this.is_mounted = true;
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    async Update(after_milliseconds: number = 0):
        Promise<void>
    {
        await Wait(after_milliseconds);

        await this.Lock();
        try {
            if (this.Is_Mounted()) {
                await this.Before_Update();
                {
                    this.was_component_did_update_called = false;
                    await this.Render_();

                    while (
                        this.was_component_will_unmount_called === false &&
                        this.was_component_did_update_called === false
                    ) {
                        await Wait(1);
                    }

                    if (this.was_component_will_unmount_called === false) {
                        this.element = ReactDom.findDOMNode(this) as HTMLElement;
                    } else {
                        this.element = null;
                    }
                }
                await this.After_Update();
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    private async Render_():
        Promise<void>
    {
        if (this.was_component_will_unmount_called === false) {
            await this.Before_Render();
            {
                this.renderable = await this.On_Render();

                if (this.was_component_will_unmount_called === false) {
                    this.was_render_called = false;
                    this.forceUpdate();

                    while (
                        this.was_component_will_unmount_called === false &&
                        this.was_render_called === false
                    ) {
                        await Wait(1);
                    }
                }

                this.renderable = null;
            }
            await this.After_Render();
        }
    }

    private async Unmount():
        Promise<void>
    {
        await this.Lock();
        try {
            if (this.was_component_will_unmount_called === false) {
                throw new Error(`componentWillUnmount() must be called before this function`);
            } else if (this.Is_Unmounted()) {
                throw new Error(`This component is already unmounted.`);
            } else {
                await this.Before_Unmount();
                {
                    await this.Before_Remove_Listeners();
                    this.Event_Grid().Remove(this);
                    await this.After_Remove_Listeners();

                    this.element = null;
                }
                await this.After_Unmount();

                this.is_mounted = false;
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    /* Mounting */
    async Before_Mount():
        Promise<void>
    {
    }

    async Before_Add_Listeners():
        Promise<void>
    {
    }

    async On_Add_Listeners():
        Promise<Event.Listener_Info[]>
    {
        return [];
    }

    async After_Add_Listeners():
        Promise<void>
    {
    }

    async After_Mount():
        Promise<void>
    {
    }

    /* Updating */
    async Before_Update():
        Promise<void>
    {
    }

    async Before_Render():
        Promise<void>
    {
    }

    async On_Render():
        Promise<JSX.Element | null>
    {
        return null;
    }

    async After_Render():
        Promise<void>
    {
    }

    async After_Update():
        Promise<void>
    {
    }

    /* Unmounting */
    async Before_Unmount():
        Promise<void>
    {
    }

    async Before_Remove_Listeners():
        Promise<void>
    {
    }

    async After_Remove_Listeners():
        Promise<void>
    {
    }

    async After_Unmount():
        Promise<void>
    {
    }

    /* React */
    componentDidMount():
        void
    {
        this.was_component_did_mount_called = true;
    }

    render():
        JSX.Element | null
    {
        this.was_render_called = true;

        return this.renderable;
    }

    componentDidUpdate():
        void
    {
        this.was_component_did_update_called = true;
    }

    componentWillUnmount():
        void
    {
        this.was_component_will_unmount_called = true;
        this.Unmount();
    }
}
