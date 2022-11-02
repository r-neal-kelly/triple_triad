import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Arena } from "../arena";
import { Player } from "../player";
import { Stake } from "./stake";

type Hand_Props = {
    model: Model.Player;
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

    Stake(stake_index: Model.Stake_Index):
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
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Hand_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Hand_Height();
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
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

        return (
            <div
                className={`Hand`}
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake_Index) =>
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
        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            overflowX: `hidden`,
            overflowY: `auto`,

            scrollbarWidth: `none`,
        });
    }

    override On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Model().Index();

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
