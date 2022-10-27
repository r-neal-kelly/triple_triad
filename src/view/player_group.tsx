import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Arena } from "./arena";
import { Player } from "../view";

type Player_Group_Props = {
    model: Model.Player_Group;
    parent: Arena;
    event_grid: Event.Grid;
}

export class Player_Group extends Component<Player_Group_Props>
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

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateRows: `1fr`,
            gridGap: `0 0`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const arena: Arena = this.Arena();
        const model: Model.Player_Group = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const relative_to: Model.Direction_e = model.Relative_To();
        const player_count: Model.Player_Count = model.Player_Count();
        const column_count: Model.Column_Count = is_runt ?
            player_count + 1 :
            player_count;

        this.Change_Style(
            `gridTemplateColumns`,
            `repeat(${column_count}, 1fr)`,
        );
        this.Change_Style(
            `width`,
            `calc(
                ${arena.CSS_Player_Width()} * ${column_count} +
                (${arena.CSS_Player_Width()} - ${arena.CSS_Card_Width()})
            )`,
        );
        this.Change_Style(
            `height`,
            arena.CSS_Player_Height(),
        );
        this.Change_Style(
            `padding`,
            `0 calc(
                (${arena.CSS_Player_Width()} - ${arena.CSS_Card_Width()}) / 2
            )`,
        );

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
            const empty_player_column: JSX.Element =
                <div
                    className={`Player_Empty`}
                    style={{
                        width: arena.CSS_Player_Width(),
                        height: arena.CSS_Player_Height(),
                    }}
                >
                </div>;

            if (
                relative_to === Model.Direction_e.LEFT ||
                relative_to === Model.Direction_e.TOP
            ) {
                return (
                    <div
                        className={`Player_Group`}
                        style={this.Styles()}
                    >
                        {players}
                        {empty_player_column}
                    </div >
                );
            } else {
                return (
                    <div
                        className={`Player_Group`}
                        style={this.Styles()}
                    >
                        {empty_player_column}
                        {players}
                    </div>
                );
            }
        } else {
            return (
                <div
                    className={`Player_Group`}
                    style={this.Styles()}
                >
                    {players}
                </div>
            );
        }
    }
}
