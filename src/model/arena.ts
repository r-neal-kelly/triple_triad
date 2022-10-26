import { Count } from "../types";
import { Index } from "../types";
import { ID } from "../types";
import { URL_Path } from "../types";

import { Assert } from "../utils";
import { Random_Boolean } from "../utils";

import { Card } from "../model";
import { Rules } from "../model";
import { Selection } from "../model";
import { Player } from "../model";
import { Player_Count } from "../model";
import { Player_Index } from "../model";
import { Player_Name } from "../model";
import { Human_Player } from "../model";
import { Computer_Player } from "../model";
import { Board } from "../model";
import { Scores } from "../model";

export type Arena_ID = ID;
export type Arena_Turn_Count = Count;
export type Arena_Turn_Index = Index;

let last_arena_id: Arena_ID = 0;
function Next_Arena_ID():
    Arena_ID
{
    last_arena_id += 1;

    return last_arena_id;
}

/* An instance of a game including the rules, the board, the players, their collections, selections, and stakes. */
export class Arena
{
    private rules: Rules;
    private selections: Array<Selection>;

    private id: Arena_ID;

    private players: Array<Player>;
    private board: Board;

    private turn_count: Arena_Turn_Count;
    private turn_queue: Array<Player>;
    private turn_queue_index: Arena_Turn_Index;

    private is_input_enabled: boolean;

    private final_scores: Scores | null;

    constructor(
        {
            rules,
            selections,
        }: {
            rules: Rules,
            selections: Array<Selection>,
        },
    )
    {
        const player_count: Player_Count = rules.Player_Count();
        if (selections.length !== player_count) {
            throw new Error(`Must have a selection for each player, no more and no less.`);
        } else {
            this.rules = rules.Clone();
            this.selections = Array.from(selections);

            this.id = Next_Arena_ID();

            let human_count: Count = 0;
            let computer_count: Count = 0;
            this.players = [];
            for (let idx = 0, end = player_count; idx < end; idx += 1) {
                const selection: Selection = selections[idx];
                let player_name: Player_Name = selection.Collection().Owner_Name();
                if (selection.Is_Of_Human()) {
                    human_count += 1;
                    this.players.push(new Human_Player({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `PLAYER ${human_count}`,
                        selection: selections[idx],
                    }));
                } else {
                    computer_count += 1;
                    this.players.push(new Computer_Player({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `CPU ${computer_count}`,
                        selection: selections[idx],
                    }));
                }
            }

            this.board = new Board({
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
        Arena
    {
        return new Arena({
            rules: this.rules,
            selections: this.selections,
        });
    }

    Rules():
        Rules
    {
        return this.rules;
    }

    Selections():
        Array<Selection>
    {
        return this.selections;
    }

    ID():
        Arena_ID
    {
        return this.id;
    }

    Player_Count():
        Player_Count
    {
        return this.players.length;
    }

    Player(player_index: Player_Index):
        Player
    {
        if (player_index >= 0 && player_index < this.Player_Count()) {
            return this.players[player_index];
        } else {
            throw new Error("Invalid player_index.");
        }
    }

    Players():
        Array<Player>
    {
        return Array.from(this.players);
    }

    Current_Player_Index():
        Player_Index
    {
        return this.Current_Player().Index();
    }

    Current_Player():
        Player
    {
        if (this.Is_Game_Over()) {
            throw new Error(`This arena has no current player because the game is over.`);
        } else {
            return this.turn_queue[this.turn_queue_index];
        }
    }

    Board():
        Board
    {
        return this.board;
    }

    Turn_Count():
        Arena_Turn_Count
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
        Scores | null
    {
        return new Scores({
            players: this.players,
        });
    }

    Final_Scores():
        Scores
    {
        Assert(this.Is_Game_Over());
        Assert(this.final_scores != null);

        return this.final_scores as Scores;
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
        Array<URL_Path>
    {
        const image_set: Set<URL_Path> = new Set();
        for (const selection of this.selections) {
            for (let idx = 0, end = selection.Card_Count(); idx < end; idx += 1) {
                image_set.add(selection.Card(idx).Image());
            }
        }

        const image_array: Array<URL_Path> = [];
        for (const image of image_set.values()) {
            image_array.push(image);
        }

        return image_array;
    }
}
