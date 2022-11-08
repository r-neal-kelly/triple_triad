import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Player } from "../player";
import { Empty } from "./empty";

type Group_Props = {
    model: Model.Player.Group.Instance;
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

    Player(player_index: Model.Player.Index):
        Player
    {
        return this.Try_Array_Index(this.players, player_index);
    }

    Players():
        Array<Player>
    {
        return this.Try_Array(this.players);
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Player_Group_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Group_Height();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Player_Group_Padding_Left_Right();
    }

    Padding_Top_Bottom():
        Float
    {
        return this.Measurements().Player_Group_Padding_Top_Bottom();
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

    CSS_Padding_Left_Right():
        string
    {
        return `${this.Padding_Left_Right()}px`;
    }

    CSS_Padding_Top_Bottom():
        string
    {
        return `${this.Padding_Top_Bottom()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player.Group.Instance = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const relative_to: Model.Enum.Direction = model.Relative_To();
        const player_count: Model.Player.Count = model.Player_Count();
        const players: Array<JSX.Element> = Array(player_count).fill(null).map((
            _,
            group_player_index: Model.Player.Index,
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
            const empty: JSX.Element =
                <Empty
                    key={`empty`}

                    model={null}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />;

            if (
                relative_to === Model.Enum.Direction.LEFT ||
                relative_to === Model.Enum.Direction.TOP
            ) {
                return (
                    <div
                        className={`Group`}
                    >
                        {players}
                        {empty}
                    </div >
                );
            } else {
                return (
                    <div
                        className={`Group`}
                    >
                        {empty}
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
        const measurements: Game_Measurements = this.Measurements();
        const model: Model.Player.Group.Instance = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const player_count: Model.Player.Count = model.Player_Count();

        let column_count: Model.Board.Column.Count;
        let row_count: Model.Board.Row.Count;
        if (measurements.Is_Vertical()) {
            column_count = 1;
            row_count = is_runt ?
                player_count + 1 :
                player_count;
        } else {
            column_count = is_runt ?
                player_count + 1 :
                player_count;
            row_count = 1;
        }

        return ({
            display: `grid`,
            gridTemplateColumns: `repeat(${column_count}, 1fr)`,
            gridTemplateRows: `repeat(${row_count}, 1fr)`,
            gridGap: `0`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            padding: `${this.CSS_Padding_Top_Bottom()} ${this.CSS_Padding_Left_Right()}`,

            zIndex: `1`,
        });
    }
}
