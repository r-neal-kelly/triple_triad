import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Arena } from "../arena";
import { Player } from "../player";

type Group_Props = {
    model: Model.Player_Group;
    parent: Arena;
    event_grid: Event.Grid;
}

export class Group extends Component<Group_Props>
{
    private players: Array<Player | null> =
        new Array(this.Model().Player_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Parent();
    }

    Player(player_index: Model.Player_Index):
        Player
    {
        return this.Try_Array_Index(this.players, player_index);
    }

    Players():
        Array<Player>
    {
        return this.Try_Array(this.players);
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Group_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Group_Height();
    }

    Padding():
        Float
    {
        return this.Arena().Measurements().Player_Group_Padding();
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

    CSS_Padding():
        string
    {
        return `${this.Padding()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player_Group = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const relative_to: Model.Direction_e = model.Relative_To();
        const player_count: Model.Player_Count = model.Player_Count();
        const players: Array<JSX.Element> = Array(player_count).fill(null).map((
            _,
            group_player_index: Model.Player_Index,
        ):
            JSX.Element =>
        {
            return (
                <Player
                    key={`player_${group_player_index} `}
                    ref={ref => this.players[group_player_index] = ref}

                    model={model.Player(group_player_index)}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            );
        });

        if (is_runt) {
            const arena: Arena = this.Arena();
            const empty_player_column: JSX.Element =
                <div
                    className={`Player_Empty`}
                    style={{
                        width: `${arena.Measurements().Player_Width()}px`,
                        height: `${arena.Measurements().Player_Height()}px`,
                    }}
                >
                </div>;

            if (
                relative_to === Model.Direction_e.LEFT ||
                relative_to === Model.Direction_e.TOP
            ) {
                return (
                    <div
                        className={`Group`}
                    >
                        {players}
                        {empty_player_column}
                    </div >
                );
            } else {
                return (
                    <div
                        className={`Group`}
                    >
                        {empty_player_column}
                        {players}
                    </div>
                );
            }
        } else {
            return (
                <div
                    className={`Group`}
                >
                    {players}
                </div>
            );
        }
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Model.Player_Group = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const player_count: Model.Player_Count = model.Player_Count();
        const column_count: Model.Column_Count = is_runt ?
            player_count + 1 :
            player_count;

        return ({
            display: `grid`,
            gridTemplateColumns: `repeat(${column_count}, 1fr)`,
            gridTemplateRows: `1fr`,
            gridGap: `0 0`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            padding: `0 ${this.CSS_Padding()}`,
        });
    }
}
