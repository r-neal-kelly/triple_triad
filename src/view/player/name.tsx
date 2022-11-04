import { Float } from "../../types";

import { Wait } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";
import { Bumper } from "./bumper";

type Name_Props = {
    model: Model.Player.Instance;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Name extends Component<Name_Props>
{
    static Scroll_Duration():
        Float
    {
        return 2000;
    }

    static Scroll_Wait():
        Float
    {
        return 5000;
    }

    private scroll_distance: Float = 0.0;

    Player_Bumper():
        Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.Model().Index();
    }

    Scroll_Distance():
        Float
    {
        return this.scroll_distance;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Name`}
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        this.Try_To_Scroll();

        return [];
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,

            overflowX: `hidden`,
            overflowY: `hidden`,

            color: `white`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }

    override On_Resize(
        data: Event.Resize_Data,
    ):
        void
    {
        super.On_Resize(data);

        this.Try_To_Scroll();
    }

    async Try_To_Scroll():
        Promise<void>
    {
        await Wait(Name.Scroll_Wait());
        if (this.Is_Alive()) {
            const element: HTMLElement = this.Some_Element();
            const previous_scroll_left = element.scrollLeft;
            element.scrollLeft = element.scrollWidth;
            if (this.scroll_distance !== element.scrollLeft) {
                this.scroll_distance = element.scrollLeft;
                element.scrollLeft = 0;
                if (this.scroll_distance >= 1.0) {
                    this.Animate_By_Frame(
                        this.Animate_Scroll,
                        {
                            duration: Name.Scroll_Duration(),
                            direction: Model.Enum.Direction.RIGHT,
                            distance: this.scroll_distance,
                            interval: this.scroll_distance / Name.Scroll_Duration(),
                        },
                    );
                }
            } else {
                element.scrollLeft = previous_scroll_left;
            }
        }
    }

    async Animate_Scroll(
        {
            elapsed,
        }: Component_Animation_Frame,
        state: {
            duration: Float,
            direction: Model.Enum.Direction,
            distance: Float,
            interval: Float,
        },
    ):
        Promise<boolean>
    {
        if (
            this.Is_Alive() &&
            this.scroll_distance === state.distance
        ) {
            const element: HTMLElement = this.Some_Element();
            if (state.direction === Model.Enum.Direction.RIGHT) {
                if (elapsed >= state.duration) {
                    element.scrollLeft = state.distance;
                    await Wait(Name.Scroll_Wait());
                    if (this.Is_Alive()) {
                        this.Animate_By_Frame(
                            this.Animate_Scroll,
                            {
                                duration: state.duration,
                                direction: Model.Enum.Direction.LEFT,
                                distance: state.distance,
                                interval: state.interval,
                            },
                        );
                    }

                    return false;
                } else {
                    element.scrollLeft = (elapsed) * state.interval;

                    return true;
                }
            } else {
                if (elapsed >= state.duration) {
                    element.scrollLeft = 0.0;
                    await Wait(Name.Scroll_Wait());
                    if (this.Is_Alive()) {
                        this.Animate_By_Frame(
                            this.Animate_Scroll,
                            {
                                duration: state.duration,
                                direction: Model.Enum.Direction.RIGHT,
                                distance: state.distance,
                                interval: state.interval,
                            },
                        );
                    }

                    return false;
                } else {
                    element.scrollLeft = (state.duration - elapsed) * state.interval;

                    return true;
                }
            }
        } else {
            return false;
        }
    }
}
