import { Direction_e } from "../model";
import { Arena } from "./arena";
import { Player } from "../model";
import { Player_Count } from "../model";
import { Player_Index } from "../model";

export class Player_Group
{
    private arena: Arena;
    private is_runt: boolean;
    private relative_to: Direction_e;
    private from_index: Player_Index;
    private count: Player_Count;

    constructor(
        {
            arena,
            is_runt,
            relative_to,
            from_index,
            count,
        }: {
            arena: Arena,
            is_runt: boolean,
            relative_to: Direction_e,
            from_index: Player_Index,
            count: Player_Count,
        },
    )
    {
        this.arena = arena;
        this.is_runt = is_runt;
        this.relative_to = relative_to;
        this.from_index = from_index;
        this.count = count;
    }

    Arena():
        Arena
    {
        return this.arena;
    }

    Is_Runt():
        boolean
    {
        return this.is_runt;
    }

    Relative_To():
        Direction_e
    {
        return this.relative_to;
    }

    From_Player_Index():
        Player_Index
    {
        return this.from_index;
    }

    Player_Count():
        Player_Count
    {
        return this.count;
    }

    Player(group_player_index: Player_Index):
        Player
    {
        if (
            group_player_index == null ||
            group_player_index < 0 ||
            group_player_index >= this.count
        ) {
            throw new Error(`Invalid index of ${group_player_index}.`);
        } else {
            return this.arena.Player(this.from_index + group_player_index);
        }
    }
}
