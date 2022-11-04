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
        return [];

        this.Animate_By_Frame(
            this.Animate_Scroll,
            {
                direction: Model.Enum.Direction.LEFT,
                current_scroll: 0.0,
            },
        );

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
        const multiplier = 0.0003;
        const wait = 2000;

        if (this.Is_Alive()) {
            const element = this.Some_Element();
            if (state.direction === Model.Enum.Direction.LEFT) {
                if (state.current_scroll >= element.scrollWidth) {
                    await Wait(wait);
                    this.Animate_By_Frame(
                        this.Animate_Scroll,
                        {
                            direction: Model.Enum.Direction.RIGHT,
                            current_scroll: element.scrollLeft,
                        },
                    );

                    return false;
                } else {
                    element.scrollLeft += elapsed * multiplier;
                    state.current_scroll += elapsed * multiplier;

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
                    element.scrollLeft -= elapsed * multiplier;
                    state.current_scroll -= elapsed * multiplier;

                    return true;
                }
            }
        } else {
            return false;
        }
    }
}
