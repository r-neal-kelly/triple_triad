import { Assert } from "../../utils";
import { Random_Boolean } from "../../utils";

import * as Enum from "../enum";
import * as Card from "../card";
import * as Rules from "../rules";
import * as Selection from "../selection";
import * as Player from "../player";
import * as Board from "../board";

import { ID } from "./id";
import * as Turn from "./turn";

let arena_id: ID = 0;
function New_Arena_ID():
    ID
{
    return arena_id++;
}

/* An instance of a game including the rules, the board, the players, their collections, selections, and stakes. */
export class Instance
{
    private rules: Rules.Instance;
    private selections: Array<Selection.Instance>;

    private id: ID;

    private players: Array<Player.Instance>;
    private board: Board.Instance;

    private turn_count: Turn.Count;
    private turn_queue: Array<Player.Instance>;
    private turn_queue_index: Turn.Index;

    private is_input_enabled: boolean;

    private final_scores: Player.Scores | null;

    constructor(
        {
            rules,
            selections,
        }: {
            rules: Rules.Instance,
            selections: Array<Selection.Instance>,
        },
    )
    {
        const player_count: Player.Count = rules.Player_Count();
        if (selections.length !== player_count) {
            throw new Error(`Must have a selection for each player, no more and no less.`);
        } else {
            this.rules = rules.Clone();
            this.selections = Array.from(selections);

            this.id = New_Arena_ID();

            let human_count: Player.Count = 0;
            let computer_count: Player.Count = 0;
            this.players = [];
            for (let idx = 0, end = player_count; idx < end; idx += 1) {
                const selection: Selection.Instance = selections[idx];
                let player_name: Player.Name = selection.Collection().Owner_Name();
                if (selection.Is_Of_Human()) {
                    human_count += 1;
                    this.players.push(new Player.Human({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `PLAYER ${human_count}`,
                        selection: selections[idx],
                    }));
                } else {
                    computer_count += 1;
                    this.players.push(new Player.Computer({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `CPU ${computer_count}`,
                        selection: selections[idx],
                    }));
                }
            }

            this.board = new Board.Instance({
                arena: this,
            });

            this.turn_count = rules.Cell_Count();
            this.turn_queue = Array.from(this.players).sort(() => Random_Boolean() ? 1 : -1);
            this.turn_queue_index = 0;

            this.is_input_enabled = true;

            this.final_scores = null;

            Object.freeze(this.rules);
            Object.freeze(this.selections);
            Object.freeze(this.players);
            Object.freeze(this.turn_queue);
        }
    }

    New():
        Instance
    {
        return new Instance({
            rules: this.rules,
            selections: this.selections,
        });
    }

    Rules():
        Rules.Instance
    {
        return this.rules;
    }

    Selections():
        Array<Selection.Instance>
    {
        return this.selections;
    }

    ID():
        ID
    {
        return this.id;
    }

    Player_Count():
        Player.Count
    {
        return this.players.length;
    }

    Player(player_index: Player.Index):
        Player.Instance
    {
        if (player_index >= 0 && player_index < this.Player_Count()) {
            return this.players[player_index];
        } else {
            throw new Error("Invalid player_index.");
        }
    }

    Players():
        Array<Player.Instance>
    {
        return Array.from(this.players);
    }

    Player_Groups(
        player_group_count: Player.Group.Count,
        put_remainder_on: Enum.Direction,
    ):
        Array<Player.Group.Instance>
    {
        const player_count: Player.Count = this.Player_Count();

        player_group_count = Math.floor(player_group_count);
        Assert(
            player_group_count > 0 &&
            player_group_count <= player_count
        );
        Assert(
            put_remainder_on === Enum.Direction.LEFT ||
            put_remainder_on === Enum.Direction.TOP ||
            put_remainder_on === Enum.Direction.RIGHT ||
            put_remainder_on === Enum.Direction.BOTTOM
        );

        const remainder: Player.Count = player_count % player_group_count;
        const group_player_count: Player.Count = (player_count - remainder) / player_group_count;
        const groups: Array<Player.Group.Instance> = new Array(player_group_count).fill(null);

        let remainder_left: Player.Count = remainder;
        if (
            put_remainder_on === Enum.Direction.LEFT ||
            put_remainder_on === Enum.Direction.TOP
        ) {
            for (let idx = 0, player_idx = 0, end = player_group_count; idx < end;) {
                let player_count: Player.Count = group_player_count;
                let is_runt: boolean;
                if (remainder_left > 0) {
                    player_count += 1;
                    remainder_left -= 1;
                    is_runt = false;
                } else {
                    is_runt = remainder > 0;
                }

                groups[idx] = new Player.Group.Instance({
                    arena: this,
                    is_runt: is_runt,
                    relative_to: put_remainder_on,
                    from_index: player_idx,
                    count: player_count,
                });

                idx += 1;
                player_idx += player_count;
            }
        } else {
            for (let idx = player_group_count, player_idx = player_count, end = 0; idx > end;) {
                let player_count: Player.Count = group_player_count;
                let is_runt: boolean;
                if (remainder_left > 0) {
                    player_count += 1;
                    remainder_left -= 1;
                    is_runt = false;
                } else {
                    is_runt = remainder > 0;
                }

                idx -= 1;
                player_idx -= player_count;

                groups[idx] = new Player.Group.Instance({
                    arena: this,
                    is_runt: is_runt,
                    relative_to: put_remainder_on,
                    from_index: player_idx,
                    count: player_count,
                });
            }
        }

        return groups;
    }

    Current_Player_Index():
        Player.Index
    {
        return this.Current_Player().Index();
    }

    Current_Player():
        Player.Instance
    {
        if (this.Is_Game_Over()) {
            throw new Error(`This arena has no current player because the game is over.`);
        } else {
            return this.turn_queue[this.turn_queue_index];
        }
    }

    Board():
        Board.Instance
    {
        return this.board;
    }

    Turn_Count():
        Turn.Count
    {
        return this.turn_count;
    }

    Is_On_Human_Turn():
        boolean
    {
        if (this.Is_Game_Over()) {
            return false;
        } else {
            return this.Current_Player().Is_Human();
        }
    }

    Is_On_Computer_Turn():
        boolean
    {
        if (this.Is_Game_Over()) {
            return false;
        } else {
            return !this.Is_On_Human_Turn();
        }
    }

    Next_Turn():
        void
    {
        Assert(
            this.Is_Game_Over() === false,
            `No more turns, the game is over.`,
        );

        this.turn_count -= 1;
        this.turn_queue_index += 1;
        if (this.turn_queue_index === this.turn_queue.length) {
            this.turn_queue_index = 0;
        }

        if (this.Is_Game_Over()) {
            this.final_scores = this.Current_Scores();
        }
    }

    Is_Input_Enabled():
        boolean
    {
        return this.is_input_enabled;
    }

    Enable_Input():
        void
    {
        this.is_input_enabled = true;
    }

    Disable_Input():
        void
    {
        this.is_input_enabled = false;
    }

    Is_Game_Over():
        boolean
    {
        return this.turn_count === 0;
    }

    Current_Scores():
        Player.Scores | null
    {
        return new Player.Scores({
            players: this.players,
        });
    }

    Final_Scores():
        Player.Scores
    {
        Assert(this.Is_Game_Over());
        Assert(this.final_scores != null);

        return this.final_scores as Player.Scores;
    }

    Has_Human_Players():
        boolean
    {
        for (const player of this.players) {
            if (player.Is_Human()) {
                return true;
            }
        }

        return false;
    }

    Card_Images():
        Array<Card.Image>
    {
        const image_set: Set<Card.Image> = new Set();
        for (const selection of this.selections) {
            for (let idx = 0, end = selection.Card_Count(); idx < end; idx += 1) {
                image_set.add(selection.Card(idx).Image());
            }
        }

        const image_array: Array<Card.Image> = [];
        for (const image of image_set.values()) {
            image_array.push(image);
        }

        return image_array;
    }
}
