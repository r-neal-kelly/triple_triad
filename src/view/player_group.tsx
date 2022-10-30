import { Float } from "../types";

import * as Model from "../model";

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

    Refresh_Styles():
        void
    {
        const model: Model.Player_Group = this.Model();
        const is_runt: boolean = model.Is_Runt();
        const player_count: Model.Player_Count = model.Player_Count();
        const column_count: Model.Column_Count = is_runt ?
            player_count + 1 :
            player_count;

        this.Change_Style(`gridTemplateColumns`, `repeat(${column_count}, 1fr)`);

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        this.Change_Style(`padding`, `0 ${this.CSS_Padding()}`);
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

        this.Refresh_Styles();

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

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
        ]);
    }

    On_Resize(
        {
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: this.Width(),
                    height: this.Height(),
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
    }
}
