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
        (async function (
            this: Name,
        )
        {
            await Wait(5000);

            this.Animate_By_Frame(
                this.Animate_Scroll,
                {
                    direction: Model.Enum.Direction.LEFT,
                    current_scroll: 0.0,
                },
            );
        }.bind(this))();

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

    // now this is pretty neat, but I want all player names moving in unison
    // so we should probably go to the Group type and send this as an event.
    // the event would tell us what direction we need to scroll. the listener
    // would only return after making a complete scroll, that way they all start
    // at the same time at least. if we really wanted to be fancy, we could try
    // to normalize the speed of each individual scroll so that they all
    // finish at the same time too. we may also want to do a custom resize handler
    // here so that we initiate the scroll only when it needs to happen
    async Animate_Scroll(
        {
            elapsed,
        }: Component_Animation_Frame,
        state: {
            direction: Model.Enum.Direction,
            current_scroll: Float,
        },
    ):
        Promise<boolean>
    {
        const multiplier = 0.0007;
        const wait = 5000;

        if (this.Is_Alive()) {
            const element = this.Some_Element();
            if (state.direction === Model.Enum.Direction.LEFT) {
                if (state.current_scroll >= element.scrollWidth - element.clientWidth) {
                    await Wait(wait);
                    this.Animate_By_Frame(
                        this.Animate_Scroll,
                        {
                            direction: Model.Enum.Direction.RIGHT,
                            current_scroll: element.scrollWidth - element.clientWidth,
                        },
                    );

                    return false;
                } else {
                    state.current_scroll += elapsed * multiplier;
                    element.scrollLeft = state.current_scroll;

                    return true;
                }
            } else {
                if (state.current_scroll <= 0.0) {
                    await Wait(wait);
                    this.Animate_By_Frame(
                        this.Animate_Scroll,
                        {
                            direction: Model.Enum.Direction.LEFT,
                            current_scroll: 0.0,
                        },
                    );

                    return false;
                } else {
                    state.current_scroll -= elapsed * multiplier;
                    element.scrollLeft = state.current_scroll;

                    return true;
                }
            }
        } else {
            return false;
        }
    }
}
