import React from "react";
import ReactDom from "react-dom";

import { Integer } from "../types";
import { Index } from "../types";
import { Name } from "../types";

import { Assert } from "../utils";
import { Wait } from "../utils";

import * as Event from "../event";

export type Component_ID = Integer;
let component_id = 0;
function New_Component_ID():
    Component_ID
{
    return component_id++;
}

export type Component_Styles = {
    [index: string]: string,
};

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
    // we need to add a Children() function that gets all child components,
    // a Parent() function to get parent component or null to replace the prop
    // a Parent_Element() function to get the dom parent or null
    // and likewise a Children_Elements() to get the dom children.
    // what we'll do is use ReactDom to find the component and try to cache
    // at least the parent, which can't be removed without first destroying
    // its children components. now I think we might be able to do that
    // for children too, but I need to think it through
    private id: Component_ID = New_Component_ID();
    private styles: Component_Styles = {};
    private stylesheet: HTMLStyleElement | null = null;
    private stylesheet_selectors: { [index: Name]: Index } = {};
    private body: HTMLElement | null = null;
    private is_alive: boolean = false;
    private is_refreshing: boolean = true;

    constructor(props: T)
    {
        super(props);

        this.styles = Object.assign({
            boxSizing: `border-box`,

            margin: `0`,
            padding: `0`,

            backgroundColor: `transparent`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            WebkitUserSelect: `none`,
            MozUserSelect: `none`,
            msUserSelect: `none`,
            userSelect: `none`,
        }, this.Before_Life());
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

        // we really should wait until we know all children
        // are completely dead, but because there's no built
        // in way to get children like unto the dom, we skip for now.
        // but in the future, what we can do to get children is
        // get the element, nab the children from the dom, and
        // try to get a component for each, and then we don't need
        // to worry about the rest.

        this.On_Death();
        this.Event_Grid().Remove(this);

        if (this.stylesheet != null && this.stylesheet.parentElement != null) {
            this.stylesheet.parentElement.removeChild(this.stylesheet);
        }

        this.stylesheet = null;
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

    ID():
        Component_ID
    {
        return this.id;
    }

    Style(style_name_in_camel_case: string):
        string
    {
        return this.styles[style_name_in_camel_case];
    }

    Styles():
        Component_Styles
    {
        return Object.assign({}, this.styles);
    }

    Change_Style(style_name_in_camel_case: string, style_value: string):
        void
    {
        this.styles[style_name_in_camel_case] = style_value;
        if (this.body) {
            (this.body.style as any)[style_name_in_camel_case] = style_value;
        }
    }

    Maybe_Stylesheet():
        HTMLStyleElement | null
    {
        return this.stylesheet;
    }

    Some_Stylesheet():
        HTMLStyleElement
    {
        if (this.stylesheet == null) {
            // it's actually less efficient trying to store
            // rules on one stylesheet, and so we have one
            // stylesheet per live component. naturally
            // it's deleted upon death
            this.stylesheet = document.createElement(`style`);
            document.head.appendChild(this.stylesheet);
        }
        Assert(this.stylesheet != null);
        Assert(this.stylesheet.parentElement === document.head);
        Assert(this.stylesheet.sheet != null);

        return this.stylesheet;
    }

    Maybe_Element():
        HTMLElement | null
    {
        return this.body as HTMLElement;
    }

    Some_Element():
        HTMLElement
    {
        return this.Try_Object(this.body);
    }

    Try_Object<T>(
        object: T | null,
    ):
        T
    {
        if (object == null) {
            throw this.Error_Not_Rendered();
        } else {
            return object;
        }
    }

    Try_Array<T>(
        array: Array<T | null> | null,
    ):
        Array<T>
    {
        if (array == null) {
            throw this.Error_Not_Rendered();
        } else {
            const elements: Array<T> = [];
            for (const element of array) {
                if (element == null) {
                    throw this.Error_Not_Rendered();
                } else {
                    elements.push(element) as T;
                }
            }

            return elements;
        }
    }

    Try_Array_Index<T>(
        array: Array<T | null> | null,
        index: Index | null,
    ):
        T
    {
        if (array == null) {
            throw this.Error_Not_Rendered();
        } else {
            if (index == null || index < 0 || index >= array.length) {
                throw new Error(`index of ${index} is invalid.`);
            } else if (array[index] == null) {
                throw this.Error_Not_Rendered();
            } else {
                return array[index] as T;
            }
        }
    }

    Error_Not_Rendered():
        Error
    {
        return new Error(`Component is not rendered.`);
    }

    Change_Animation(
        {
            animation_name,
            animation_body,
        }: {
            animation_name: Name,
            animation_body: string,
        },
    ):
        void
    {
        const sheet: CSSStyleSheet =
            this.Some_Stylesheet().sheet as CSSStyleSheet;
        Assert(sheet != null);
        const full_animation_name: string =
            `${animation_name}_${this.ID()}`;
        const animation_selector: string =
            `@keyframes ${full_animation_name}`;

        let rule_index: Index;
        if (this.stylesheet_selectors[animation_selector] != null) {
            rule_index = this.stylesheet_selectors[animation_selector];
            sheet.deleteRule(rule_index);
        } else {
            rule_index = sheet.cssRules.length;
        }
        this.stylesheet_selectors[animation_selector] = rule_index;
        sheet.insertRule(
            `${animation_selector} {
                ${animation_body}
            }`,
            rule_index,
        );
    }

    async Animate(
        {
            animation_name,
            duration_in_milliseconds,
            css_iteration_count = `infinite`,
            css_timing_function = `ease`,
            css_direction = `normal`,
            css_fill_mode = `none`,
        }: {
            animation_name: Name,
            duration_in_milliseconds: Integer,
            css_iteration_count?: string,
            css_timing_function?: string,
            css_direction?: string,
            css_fill_mode?: string,
        },
    ):
        Promise<void>
    {
        Assert(this.Is_Alive());

        this.Change_Style(`animationName`, `${animation_name}_${this.ID()}`);
        this.Change_Style(`animationDuration`, `${duration_in_milliseconds}ms`);
        this.Change_Style(`animationIterationCount`, css_iteration_count);
        this.Change_Style(`animationTimingFunction`, css_timing_function);
        this.Change_Style(`animationDirection`, css_direction);
        this.Change_Style(`animationFillMode`, css_fill_mode);

        await Wait(duration_in_milliseconds);
    }

    Deanimate():
        void
    {
        this.Change_Style(`animationName`, ``);
    }
}
