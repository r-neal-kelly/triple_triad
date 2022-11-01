import { Index } from "../types";
import { Float } from "../types";

import { Random_Integer_Exclusive } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Main } from "./main";
import { Exhibition } from "./exhibition";

type Exhibitions_Props = {
    model: Model.Main;
    parent: Main;
    event_grid: Event.Grid;
}

export class Exhibitions extends Component<Exhibitions_Props>
{
    private exhibitions: Array<Exhibition | null> =
        new Array(this.Model().Exhibition_Count()).fill(null);
    private exhibition_event_grids: Array<Event.Grid> =
        Array.from(new Array(this.Model().Exhibition_Count()).fill(null).map(() => new Event.Grid()));

    private is_switching: boolean = false;
    private last_switch_method_index: Index = Number.MAX_SAFE_INTEGER;

    Main():
        Main
    {
        return this.Parent();
    }

    Exhibition(exhibition_index: Model.Exhibition_Index):
        Exhibition
    {
        return this.Try_Array_Index(this.exhibitions, exhibition_index);
    }

    Exhibitions():
        Array<Exhibition>
    {
        return this.Try_Array(this.exhibitions);
    }

    Exhibition_Event_Grid(exhibition_index: Model.Exhibition_Index):
        Event.Grid
    {
        return this.Try_Array_Index(this.exhibition_event_grids, exhibition_index);
    }

    Exhibition_Event_Grids():
        Array<Event.Grid>
    {
        return this.Try_Array(this.exhibition_event_grids);
    }

    Is_Switching():
        boolean
    {
        return this.is_switching;
    }

    Width():
        Float
    {
        return this.Parent().Width();
    }

    Height():
        Float
    {
        return this.Parent().Height();
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    Refresh_Animations():
        void
    {
        this.Change_Animation({
            animation_name: `Fade_In`,
            animation_body: `
                0% {
                    opacity: 0%;
                }
            
                100% {
                    opacity: 100%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Fade_Out`,
            animation_body: `
                0% {
                    opacity: 100%;
                }
            
                100% {
                    opacity: 0%;
                }
            `,
        });
    }

    Refresh_Styles():
        void
    {
        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());
    }

    Before_Life():
        Component_Styles
    {
        this.Refresh_Animations();

        return ({
            display: `none`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Main = this.Model();
        const exhibition_count: Model.Exhibition_Count = model.Exhibition_Count();

        this.Refresh_Styles();

        return (
            <div
                className={`Exhibitions`}
                style={this.Styles()}
            >
                {
                    Array(exhibition_count).fill(null).map((
                        _: null,
                        exhibition_index: Model.Exhibition_Index,
                    ):
                        JSX.Element =>
                    {
                        return (
                            <Exhibition
                                key={`exhibition_${exhibition_index}`}
                                ref={ref => this.exhibitions[exhibition_index] = ref}

                                model={model.Exhibition(exhibition_index)}
                                parent={this}
                                event_grid={this.Exhibition_Event_Grid(exhibition_index)}
                            />
                        );
                    })
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return [
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.START_EXHIBITIONS),
                event_handler: this.On_Start_Exhibitions,
            },
            {
                event_name: new Event.Name(Event.ON, Event.STOP_EXHIBITIONS),
                event_handler: this.On_Stop_Exhibitions,
            },
            {
                event_name: new Event.Name(Event.ON, Event.SWITCH_EXHIBITIONS),
                event_handler: this.On_Switch_Exhibitions,
            },
        ];
    }

    On_Resize(
        {
            width,
            height,
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width,
                    height,
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
    }

    async On_Start_Exhibitions(
        {
            exhibition,
        }: Event.Start_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Change_Style(`display`, ``);
            await this.Animate({
                animation_name: `Fade_In`,
                duration_in_milliseconds: 2000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });
            this.Deanimate();
        }
    }

    async On_Stop_Exhibitions(
        {
        }: Event.Stop_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Animate({
                animation_name: `Fade_Out`,
                duration_in_milliseconds: 2000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });
            this.Deanimate();
            this.Change_Style(`display`, `none`);
        }
    }

    async On_Switch_Exhibitions(
        {
            previous_exhibition,
            next_exhibition,
        }: Event.Switch_Exhibitions_Data,
    ):
        Promise<void>
    {
        this.is_switching = true;

        if (this.Is_Alive()) {
            const previous: Exhibition = this.Exhibition(previous_exhibition.Index());
            const next: Exhibition = this.Exhibition(next_exhibition.Index());

            // we do several cool different transitions,
            // including fade-outs and swipes in various directions
            const methods: Array<() => Promise<[void, void]>> = [
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Right`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Left`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Bottom`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Top`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Left`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Right`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Top`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Bottom`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
            ];

            let method_index: Index = this.last_switch_method_index;
            while (method_index === this.last_switch_method_index) {
                method_index = Random_Integer_Exclusive(0, methods.length);
            }
            this.last_switch_method_index = method_index;

            next.Change_Style(`display`, ``);
            await methods[method_index]();
            if (this.Is_Alive()) {
                previous.Change_Style(`display`, `none`);

                previous.Deanimate();
                next.Deanimate();

                await Promise.all([
                    previous.Refresh(),
                    next.Refresh(),
                ]);
            }
        }

        this.is_switching = false;
    }
}
