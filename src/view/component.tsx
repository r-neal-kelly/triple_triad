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
    A simplification of the React Life-Cycle.

    Method Overrides/Event Handlers in the Life-Cycle:
        1.) Before_Refresh
        2.) On_Refresh
        3.) After_Refresh
        4.) On_Life
            while (Refresh) {
                Before_Refresh
                On_Refresh
                After_Refresh
            }
        5.) On_Death
    Each of these methods can be overridden by a derived class.
*/
export class Component<T extends Component_Props> extends React.Component<T>
{
    private is_refreshing: boolean = false;
    private is_alive: boolean = false;
    private body: HTMLElement | null = null;

    constructor(props: T)
    {
        super(props);

        this.is_refreshing = true;
        this.Before_Refresh();
    }

    render():
        JSX.Element | null
    {
        return this.On_Refresh();
    }

    componentDidUpdate():
        void
    {
        this.After_Refresh();
        this.body = ReactDom.findDOMNode(this) as HTMLElement;
        this.is_refreshing = false;
    }

    componentDidMount():
        void
    {
        this.componentDidUpdate();
        this.Live();
    }

    componentWillUnmount():
        void
    {
        this.Die();
    }

    private Live():
        void
    {
        this.is_alive = true;

        this.Event_Grid().Add(this);
        this.Event_Grid().Add_Many_Listeners(this, this.On_Life());
    }

    async Refresh(after_milliseconds: number = 0):
        Promise<boolean>
    {
        if (after_milliseconds > 0) {
            await Wait(after_milliseconds);
        }

        while (this.is_refreshing) {
            await Wait(1);
        }

        if (this.is_alive) {
            this.is_refreshing = true;
            this.Before_Refresh();

            this.forceUpdate();
            while (this.is_refreshing) {
                await Wait(1);
            }

            return this.is_alive;
        } else {
            return false;
        }
    }

    async Send(event_info: Event.Info):
        Promise<void>
    {
        await this.Event_Grid().Send_Event(event_info);
    }

    private async Die():
        Promise<void>
    {
        while (this.is_refreshing) {
            await Wait(1);
        }

        this.On_Death();
        this.Event_Grid().Remove(this);

        this.body = null;
        this.is_alive = false;
    }

    Before_Refresh():
        void
    {
    }

    On_Refresh():
        JSX.Element | null
    {
        return null;
    }

    After_Refresh():
        void
    {
    }

    On_Life():
        Event.Listener_Info[]
    {
        return [];
    }

    On_Death():
        void
    {
    }

    Is_Alive():
        boolean
    {
        return this.is_alive;
    }

    Is_Dead():
        boolean
    {
        return !this.is_alive;
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

    Maybe_Element():
        HTMLElement | null
    {
        return this.body as HTMLElement;
    }

    Some_Element():
        HTMLElement
    {
        if (this.body == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.body;
        }
    }

    Error_Not_Rendered():
        Error
    {
        return new Error(`Component is not rendered.`);
    }
}
