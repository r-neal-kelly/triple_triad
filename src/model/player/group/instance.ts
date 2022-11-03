import * as Enum from "../../enum";
import * as Arena from "../../arena";
import * as Player from "../../player";

export class Instance
{
    private arena: Arena.Instance;
    private is_runt: boolean;
    private relative_to: Enum.Direction;
    private from_index: Player.Index;
    private count: Player.Count;

    constructor(
        {
            arena,
            is_runt,
            relative_to,
            from_index,
            count,
        }: {
            arena: Arena.Instance,
            is_runt: boolean,
            relative_to: Enum.Direction,
            from_index: Player.Index,
            count: Player.Count,
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
        Arena.Instance
    {
        return this.arena;
    }

    Is_Runt():
        boolean
    {
        return this.is_runt;
    }

    Relative_To():
        Enum.Direction
    {
        return this.relative_to;
    }

    From_Player_Index():
        Player.Index
    {
        return this.from_index;
    }

    Player_Count():
        Player.Count
    {
        return this.count;
    }

    Player(group_player_index: Player.Index):
        Player.Instance
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
