import { Float } from "../../types";

import * as Color from "../color";
import * as Arena from "../arena";
import * as Player from "../player";

type Score = {
    score: Player.Score.Instance,
    color: Color.Instance,
};

export class Instance
{
    private max_score: Player.Score.Instance;
    private scores: Array<Score>;

    constructor(
        {
            arena,
        }: {
            arena: Arena.Instance,
        },
    )
    {
        this.max_score =
            arena.Player_Count() * arena.Rules().Selection_Card_Count();
        this.scores = [];

        for (let idx = 0, end = arena.Player_Count(); idx < end; idx += 1) {
            const player: Player.Instance = arena.Player(idx);
            const player_score: Player.Score.Instance = player.Score();
            const player_color: Color.Instance = player.Color();
            this.scores.push({
                score: player_score,
                color: player_color,
            });
        }

        Object.freeze(this.scores);
        Object.freeze(this);
    }

    Player_Count():
        Player.Count
    {
        return this.scores.length;
    }

    Player_Color(player_index: Player.Index):
        Color.Instance
    {
        return this.scores[player_index].color;
    }

    Score_Percent(player_index: Player.Index):
        Float
    {
        return this.scores[player_index].score * 100 / this.max_score;
    }

    Modify(
        {
            player_index_to_decrement,
            player_index_to_increment,
        }: {
            player_index_to_decrement: Player.Index,
            player_index_to_increment: Player.Index,
        }
    ):
        void
    {
        this.scores[player_index_to_decrement].score -= 1;
        this.scores[player_index_to_increment].score += 1;
    }
}
