import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Bumper } from "./bumper";

type Name_Props = {
    model: Model.Player.Instance;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Name extends Component<Name_Props>
{
    Arena():
        Arena
    {
        return this.Player_Bumper().Arena();
    }

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

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Scroll_Distance():
        Float
    {
        const element: HTMLElement = this.Some_Element();
        const previous_scroll_left = element.scrollLeft;
        element.scrollLeft = element.scrollWidth;
        const scroll_distance = element.scrollLeft;
        element.scrollLeft = previous_scroll_left;

        return scroll_distance;
    }

    Current_Scroll_Distance():
        Float
    {
        return this.Some_Element().scrollLeft;
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

    override On_Life():
        Array<Event.Listener_Info>
    {
        return [
            {
                event_name: new Event.Name(Event.ON, Event.SCROLL_PLAYER_NAMES),
                event_handler: this.On_Scroll_Player_Names,
            },
        ];
    }

    async On_Scroll_Player_Names(
        data: Event.Scroll_Player_Names_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Animate_By_Frame(this.Animate_Scroll.bind(this), data);
        }
    }

    private async Animate_Scroll(
        {
            elapsed,
        }: Component_Animation_Frame,
        {
            duration,
            direction,
        }: Event.Scroll_Player_Names_Data,
    ):
        Promise<boolean>
    {
        if (this.Is_Alive()) {
            const distance: Float = this.Scroll_Distance();
            if (distance >= 1.0) {
                const interval: Float = distance / duration;
                const element: HTMLElement = this.Some_Element();
                if (direction === Model.Enum.Direction.RIGHT) {
                    if (elapsed >= duration) {
                        element.scrollLeft = distance;

                        return false;
                    } else {
                        element.scrollLeft = (elapsed) * interval;

                        return true;
                    }
                } else {
                    if (elapsed >= duration) {
                        element.scrollLeft = 0.0;

                        return false;
                    } else {
                        element.scrollLeft = (duration - elapsed) * interval;

                        return true;
                    }
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
