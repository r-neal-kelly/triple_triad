import React from "react";
import ReactDom from "react-dom";

import { Wait } from "../utils";
import * as Event from "../event";

export type Component_Styles = {
    [index: string]: string,
};

/*
    Must be satisfied to inherit from Component.
*/
interface Component_Props
{
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

/*
    A simplification of the React Life-Cycle.

    Method Overrides/Event Handlers in the Life-Cycle:
        1.) Before_Life
        2.) On_Refresh
        3.) On_Life
            while (Refresh) {
                On_Refresh
            }
        4.) On_Death
    Each of these methods can be overridden by a derived class.
*/
export class Component<T extends Component_Props> extends React.Component<T>
{
    private styles: Component_Styles;
    private body: HTMLElement | null;
    private is_alive: boolean;
    private is_refreshing: boolean;

    constructor(props: T)
    {
        super(props);

        this.styles = Object.assign({}, this.Before_Life());
        this.body = null;
        this.is_alive = false;
        this.is_refreshing = true;
    }

    render():
        JSX.Element | null
    {
        return this.On_Refresh();
    }

    componentDidUpdate():
        void
    {
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

    On_Refresh():
        JSX.Element | null
    {
        return null;
    }

    Before_Life():
        Component_Styles
    {
        return {};
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

    Styles():
        Component_Styles
    {
        return Object.assign({}, this.styles);
    }

    Style(style_name_in_camel_case: string):
        string
    {
        return this.styles[style_name_in_camel_case];
    }

    Change_Style(style_name_in_camel_case: string, style_value: string):
        void
    {
        this.styles[style_name_in_camel_case] = style_value;
        if (this.body) {
            (this.body.style as any)[style_name_in_camel_case] = style_value;
        }
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
