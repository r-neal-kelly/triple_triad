import React from "react";
import ReactDom from "react-dom";

import { Integer } from "../types";
import { Index } from "../types";
import { Float } from "../types";
import { Name } from "../types";

import { Assert } from "../utils";
import { Wait } from "../utils";

import * as Event from "./event";

export type Component_ID = Integer;
let new_component_id = 0;
function New_Component_ID():
    Component_ID
{
    return new_component_id++;
}

type Animation_Name = Name;
type Component_Animation_Rule = {
    index: Index,
    end_styles: Component_Styles,
}
const COMPONENT_ANIMATION_RULES: {
    [index: Component_ID]: {
        [index: Animation_Name]: Component_Animation_Rule
    }
} = {};

export type Component_Styles = {
    [index: string]: string,
}

export type Component_Animation_Frame = {
    now: Float;
    start: Float;
    elapsed: Float;
}

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
        1.) On_Refresh
        2.) On_Restyle
        3.) On_Life
            while (Refresh) {
                On_Refresh
                On_Restyle
            } ||
            while (Restyle) {
                On_Restyle
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
    private body: HTMLElement | null = null;
    private is_alive: boolean = false;
    private is_refreshing: boolean = true;

    constructor(props: T)
    {
        super(props);

        COMPONENT_ANIMATION_RULES[this.id] = {};

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
        });
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
        this.Restyle();
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

        const listeners: Array<Event.Listener_Info> = this.On_Life();
        if (this.Parent() != null) {
            listeners.push(
                {
                    event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                    event_handler: this.On_Resize,
                },
            );
        }

        this.Event_Grid().Add(this);
        this.Event_Grid().Add_Many_Listeners(this, listeners);
    }

    Restyle():
        void
    {
        this.styles = Object.assign(this.styles, this.On_Restyle());
        if (this.body != null) {
            for (const [key, value] of Object.entries(this.styles)) {
                (this.body.style as any)[key] = value;
            }
        }
    }

    async Refresh(after_milliseconds: Integer = 0):
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

    On_Restyle():
        Component_Styles
    {
        return {};
    }

    On_Life():
        Array<Event.Listener_Info>
    {
        return [];
    }

    On_Death():
        void
    {
    }

    On_Resize(
        {
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Restyle();

            // eventually we should be able to just iterate async over cached children
            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: 0,
                    height: 0,
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
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

    private Styles():
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

    Max_Scroll_Left():
        Float
    {
        const element: HTMLElement = this.Some_Element();
        const previous_scroll_left = element.scrollLeft;
        element.scrollLeft = element.scrollWidth;
        const max_scroll_left = element.scrollLeft;
        element.scrollLeft = previous_scroll_left;

        return max_scroll_left;
    }

    Max_Scroll_Top():
        Float
    {
        const element: HTMLElement = this.Some_Element();
        const previous_scroll_top = element.scrollTop;
        element.scrollTop = element.scrollHeight;
        const max_scroll_top = element.scrollTop;
        element.scrollTop = previous_scroll_top;

        return max_scroll_top;
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
            end_styles = {},
        }: {
            animation_name: Animation_Name,
            animation_body: string,
            end_styles?: Component_Styles,
        },
    ):
        void
    {
        const sheet: CSSStyleSheet =
            this.Some_Stylesheet().sheet as CSSStyleSheet;
        Assert(sheet != null);

        let rule_index: Index;
        if (COMPONENT_ANIMATION_RULES[this.id][animation_name] != null) {
            rule_index = COMPONENT_ANIMATION_RULES[this.id][animation_name].index;
            sheet.deleteRule(rule_index);
        } else {
            rule_index = sheet.cssRules.length;
        }

        const rule: Component_Animation_Rule = {
            index: rule_index,
            end_styles: Object.assign({}, end_styles),
        };
        Object.freeze(rule.end_styles);
        Object.freeze(rule);

        COMPONENT_ANIMATION_RULES[this.id][animation_name] = rule;
        sheet.insertRule(
            `@keyframes ${animation_name}_${this.ID()} {
                ${animation_body}
            }`,
            rule_index,
        );
    }

    async Animate(
        {
            animation_name,
            animation_owner_id = this.ID(),
            duration_in_milliseconds,
            css_iteration_count = `1`,
            css_timing_function = `ease`,
            css_direction = `normal`,
        }: {
            animation_name: Animation_Name,
            animation_owner_id?: Component_ID,
            duration_in_milliseconds: Integer,
            css_iteration_count?: string,
            css_timing_function?: string,
            css_direction?: string,
        },
    ):
        Promise<void>
    {
        Assert(this.Is_Alive());
        Assert(css_iteration_count !== `infinite`); // we can add an Animate_Forever later

        const element: HTMLElement = this.Maybe_Element() as HTMLElement; // Is_Alive !== Has_Element
        if (element) {
            element.style.animationName = `${animation_name}_${animation_owner_id}`;
            element.style.animationDuration = `${duration_in_milliseconds}ms`;
            element.style.animationIterationCount = css_iteration_count;
            element.style.animationTimingFunction = css_timing_function;
            element.style.animationDirection = css_direction;

            await Wait(duration_in_milliseconds);

            element.style.animationName = ``;
            element.style.animationDuration = ``;
            element.style.animationIterationCount = ``;
            element.style.animationTimingFunction = ``;
            element.style.animationDirection = ``;

            const end_styles: Component_Styles =
                COMPONENT_ANIMATION_RULES[animation_owner_id][animation_name].end_styles;
            for (const [key, value] of Object.entries(end_styles)) {
                this.styles[key] = value;
                (element.style as any)[key] = value;
            }
        }
    }

    async Animate_Keyframes(
        keyframes: Array<Keyframe>,
        options: KeyframeEffectOptions,
    ):
        Promise<void>
    {
        Assert(keyframes.length >= 2);
        Assert(keyframes[0].offset === 0.0);
        Assert(keyframes[keyframes.length - 1].offset === 1.0);

        Assert(
            options.direction === undefined ||
            options.direction === `normal` ||
            options.direction === `reverse`
        );
        Assert(
            options.fill === undefined ||
            options.fill === `both`
        );

        if (options.direction === undefined) {
            options.direction = `normal`;
        }
        if (options.fill === undefined) {
            options.fill = `both`;
        }

        if (this.Is_Alive()) {
            const element: HTMLElement = this.Maybe_Element() as HTMLElement;
            if (element) {
                let first_keyframe: Keyframe;
                let last_keyframe: Keyframe;
                if (options.direction === `normal`) {
                    first_keyframe = keyframes[0];
                    last_keyframe = keyframes[keyframes.length - 1];
                } else {
                    first_keyframe = keyframes[keyframes.length - 1];
                    last_keyframe = keyframes[0];
                }

                for (const [key, value] of Object.entries(first_keyframe)) {
                    if (key !== `offset` && value != null) {
                        (element.style as any)[key] = value;
                    }
                }

                await new Promise<void>(function (resolve, reject):
                    void
                {
                    const animation: Animation =
                        new Animation(new KeyframeEffect(element, keyframes, options));

                    animation.onfinish = function (event: AnimationPlaybackEvent):
                        void
                    {
                        resolve();
                    };

                    animation.play();
                });

                for (const [key, value] of Object.entries(last_keyframe)) {
                    if (key !== `offset` && value != null) {
                        this.styles[key] = value.toString();
                        (element.style as any)[key] = value;
                    }
                }
            }
        }
    }

    async Animate_Opacity_Fade_In(
        options: KeyframeEffectOptions,
    ):
        Promise<void>
    {
        await this.Animate_Keyframes(
            [
                { opacity: `0%`, offset: 0.0 },
                { opacity: `100%`, offset: 1.0 },
            ],
            options,
        );
    }

    async Animate_Opacity_Fade_Out(
        options: KeyframeEffectOptions,
    ):
        Promise<void>
    {
        await this.Animate_Keyframes(
            [
                { opacity: `100%`, offset: 0.0 },
                { opacity: `0%`, offset: 1.0 },
            ],
            options,
        );
    }

    async Animate_By_Frame<State>(
        on_frame: (
            frame: Component_Animation_Frame,
            state: State,
        ) => boolean | Promise<boolean>,
        state: State,
    ):
        Promise<void>
    {
        return new Promise((resolve) =>
        {
            let start: Float | null = null;
            let last: Float = -1.0;

            async function Loop(
                this: Component<Component_Props>,
                now: Float,
            ):
                Promise<void>
            {
                if (this.Is_Alive()) {
                    if (start == null) {
                        start = now;
                    }
                    if (last !== now) {
                        last = now;
                        if (
                            await on_frame(
                                {
                                    now: now,
                                    start: start as Float,
                                    elapsed: now - start,
                                } as Component_Animation_Frame,
                                state,
                            )
                        ) {
                            window.requestAnimationFrame(Loop.bind(this));
                        } else {
                            resolve();
                        }
                    } else {
                        window.requestAnimationFrame(Loop.bind(this));
                    }
                } else {
                    resolve();
                }
            }
            window.requestAnimationFrame(Loop.bind(this));
        });
    }
}
