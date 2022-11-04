import { Integer } from "../types";
import { Index } from "../types";
import { Float } from "../types";

import { Random_Integer_Exclusive } from "../utils";
import { Plot_Bezier_Curve_4 } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Component_Animation_Frame } from "./component";
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

    Exhibition(exhibition_index: Model.Exhibition.Index):
        Exhibition
    {
        return this.Try_Array_Index(this.exhibitions, exhibition_index);
    }

    Exhibitions():
        Array<Exhibition>
    {
        return this.Try_Array(this.exhibitions);
    }

    Exhibition_Event_Grid(exhibition_index: Model.Exhibition.Index):
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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Main = this.Model();
        const exhibition_count: Model.Exhibition.Count = model.Exhibition_Count();

        return (
            <div
                className={`Exhibitions`}
            >
                {
                    Array(exhibition_count).fill(null).map((
                        _: null,
                        exhibition_index: Model.Exhibition.Index,
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

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        this.Change_Style(`display`, `none`);

        return [
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

    override On_Resize(
        {
        }: Event.Resize_Data
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Restyle();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: 0,
                    height: 0,
                } as Event.Resize_Data,
                is_atomic: false,
            });

            for (const exhibition_event_grid of this.exhibition_event_grids) {
                exhibition_event_grid.Send_Event({
                    name_affix: `${Event.RESIZE}_${this.ID()}`,
                    data: {
                        width: 0,
                        height: 0,
                    } as Event.Resize_Data,
                    is_atomic: false,
                });
            }
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
            await this.Animate_By_Frame(
                this.Animate_Fade_In,
                {
                    duration: 2000,
                },
            );
        }
    }

    async On_Stop_Exhibitions(
        {
        }: Event.Stop_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Animate_By_Frame(
                this.Animate_Fade_Out,
                {
                    duration: 2000,
                    plot: Plot_Bezier_Curve_4(
                        1.0 / (2000 - 1),
                        100.0,
                        0.0, 0.0,
                        0.42, 0.0,
                        0.58, 1.0,
                        1.0, 1.0,
                    ),
                    index: 0,
                },
            );
            if (this.Is_Alive()) {
                this.Change_Style(`display`, `none`);
            }
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

    private async Animate_Fade_In(
        {
            elapsed,
        }: Component_Animation_Frame,
        {
            duration,
        }: {
            duration: Integer,
        },
    ):
        Promise<boolean>
    {
        if (this.Is_Alive()) {
            const percent: Float = duration > 0 ?
                Math.min(elapsed * 100 / duration, 100) :
                100;
            const element: HTMLElement = this.Some_Element();
            element.style.opacity = `${percent}%`;

            return elapsed < duration;
        } else {
            return false;
        }
    }

    private async Animate_Fade_Out(
        {
            elapsed,
        }: Component_Animation_Frame,
        state: {
            duration: Integer,
            plot: Array<{
                x: Float,
                y: Float,
            }>,
            index: Integer,
        },
    ):
        Promise<boolean>
    {
        if (this.Is_Alive()) {
            if (elapsed >= state.duration) {
                const element: HTMLElement = this.Some_Element();
                element.style.opacity = `${100 - 100}%`;

                return false;
            } else {
                const x_percent: Float = state.duration > 0 ?
                    Math.min(elapsed * 100 / state.duration, 100) :
                    100;
                while (
                    state.index < state.plot.length - 1 &&
                    state.plot[state.index].x < x_percent
                ) {
                    state.index += 1;
                }
                const y_percent = state.plot[state.index].y;
                const element: HTMLElement = this.Some_Element();
                element.style.opacity = `${100 - y_percent}%`;

                return true;
            }
        } else {
            return false;
        }
    }
}
