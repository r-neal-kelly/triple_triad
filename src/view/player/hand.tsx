import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Player } from "../player";
import { Stake } from "./stake";

type Hand_Props = {
    model: Model.Player.Instance;
    parent: Player;
    event_grid: Event.Grid;
}

export class Hand extends Component<Hand_Props>
{
    private stakes: Array<Stake | null> =
        new Array(this.Model().Stake_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Stake(stake_index: Model.Stake.Index):
        Stake
    {
        return this.Try_Array_Index(this.stakes, stake_index);
    }

    Stakes():
        Array<Stake>
    {
        return this.Try_Array(this.stakes);
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

    Width():
        Float
    {
        return this.Measurements().Player_Hand_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Hand_Height();
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
        const stake_count: Model.Stake.Count = this.Model().Stake_Count();

        return (
            <div
                className={`Hand`}
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake.Index) =>
                    {
                        return (
                            <Stake
                                key={`stake_${stake_index}`}
                                ref={ref => this.stakes[stake_index] = ref}

                                model={this.Model().Stake(stake_index)}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={stake_index}
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
        const measurements: Game_Measurements = this.Measurements();

        let overflow_x: string;
        let overflow_y: string;
        if (measurements.Is_Vertical()) {
            overflow_x = `auto`;
            overflow_y = `hidden`;
        } else {
            overflow_x = `hidden`;
            overflow_y = `auto`;
        }

        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,
            zIndex: `0`,

            overflowX: overflow_x,
            overflowY: overflow_y,

            scrollbarWidth: `none`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const player_index: Model.Player.Index = this.Model().Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
            },
        ]);
    }

    async On_This_Player_Place_Stake(
        {
        }: Event.Player_Place_Stake_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}
