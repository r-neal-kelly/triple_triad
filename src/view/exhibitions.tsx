import { Index } from "../types";
import { Float } from "../types";

import { Random_Integer_Exclusive } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";

import { Main } from "./main";
import { Exhibition } from "./exhibition";

const FADE_IN_DURATION = 2000;
const FADE_OUT_DURATION = 2000;

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
            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

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
            {
                event_name: new Event.Name(Event.ON, Event.REMEASURE_EXHIBITIONS),
                event_handler: this.On_Remeasure_Exhibitions,
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

            for (let idx = 0, end = this.exhibition_event_grids.length; idx < end; idx += 1) {
                if (this.Model().Exhibition(idx).Is_Visible()) {
                    this.exhibition_event_grids[idx].Send_Event({
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
            await this.Animate(
                [
                    {
                        offset: 0.0,
                        opacity: `0%`,
                    },
                    {
                        offset: 1.0,
                        opacity: `100%`,
                    },
                ],
                {
                    duration: this.Main().Animation_Duration(FADE_IN_DURATION),
                    easing: `ease-in-out`,
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
            await this.Animate(
                [
                    {
                        offset: 0.0,
                        opacity: `100%`,
                    },
                    {
                        offset: 1.0,
                        opacity: `0%`,
                    },
                ],
                {
                    duration: this.Main().Animation_Duration(FADE_OUT_DURATION),
                    easing: `ease-in-out`,
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
            current_exhibition,
        }: Event.Switch_Exhibitions_Data,
    ):
        Promise<void>
    {
        this.is_switching = true;

        if (this.Is_Alive()) {
            const previous: Exhibition = this.Exhibition(previous_exhibition.Index());
            const current: Exhibition = this.Exhibition(current_exhibition.Index());

            this.exhibition_event_grids[current_exhibition.Index()].Send_Event({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: 0,
                    height: 0,
                } as Event.Resize_Data,
                is_atomic: false,
            });

            const methods: Array<() => Promise<[void, void]>> = [
                () => Promise.all([
                    previous.Animate(
                        [
                            {
                                offset: 0.0,
                                left: `0%`,
                                opacity: `100%`,
                            },
                            {
                                offset: 1.0,
                                left: `100%`,
                                opacity: `0%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                    current.Animate(
                        [
                            {
                                offset: 0.0,
                                left: `-100%`,
                                opacity: `0%`,
                            },
                            {
                                offset: 1.0,
                                left: `0%`,
                                opacity: `100%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                ]),
                () => Promise.all([
                    previous.Animate(
                        [
                            {
                                offset: 0.0,
                                top: `0%`,
                                opacity: `100%`,
                            },
                            {
                                offset: 1.0,
                                top: `100%`,
                                opacity: `0%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                    current.Animate(
                        [
                            {
                                offset: 0.0,
                                top: `-100%`,
                                opacity: `0%`,
                            },
                            {
                                offset: 1.0,
                                top: `0%`,
                                opacity: `100%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                ]),
                () => Promise.all([
                    previous.Animate(
                        [
                            {
                                offset: 0.0,
                                left: `0%`,
                                opacity: `100%`,
                            },
                            {
                                offset: 1.0,
                                left: `-100%`,
                                opacity: `0%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                    current.Animate(
                        [
                            {
                                offset: 0.0,
                                left: `100%`,
                                opacity: `0%`,
                            },
                            {
                                offset: 1.0,
                                left: `0%`,
                                opacity: `100%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                ]),
                () => Promise.all([
                    previous.Animate(
                        [
                            {
                                offset: 0.0,
                                top: `0%`,
                                opacity: `100%`,
                            },
                            {
                                offset: 1.0,
                                top: `-100%`,
                                opacity: `0%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                    current.Animate(
                        [
                            {
                                offset: 0.0,
                                top: `100%`,
                                opacity: `0%`,
                            },
                            {
                                offset: 1.0,
                                top: `0%`,
                                opacity: `100%`,
                            },
                        ],
                        {
                            duration: 2000,
                            easing: `ease-in-out`,
                        },
                    ),
                ]),
            ];

            let method_index: Index = this.last_switch_method_index;
            while (method_index === this.last_switch_method_index) {
                method_index = Random_Integer_Exclusive(0, methods.length);
            }
            this.last_switch_method_index = method_index;

            current.Change_Style(`display`, ``);
            await methods[method_index]();
            if (this.Is_Alive()) {
                previous.Change_Style(`display`, `none`);
            }
        }

        this.is_switching = false;
    }

    async On_Remeasure_Exhibitions(
        {
        }: Event.Remeasure_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.On_Resize(
                {
                    width: 0,
                    height: 0,
                } as Event.Resize_Data,
            );
        }
    }
}
