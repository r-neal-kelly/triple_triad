import { Float } from "../../types";

import * as Color from "../color";
import * as Arena from "../arena";
import * as Player from "../player";

type Score = {
    score: Player.Score.Instance,
    color: Color.HSLA,
};

export class Instance
{
    private arena: Arena.Instance;
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
        this.arena = arena;
        this.max_score =
            arena.Player_Count() * arena.Rules().Selection_Card_Count();
        this.scores = [];

        const turn_queue: Array<Player.Instance> = arena.Turn_Queue();
        for (let idx = 0, end = turn_queue.length; idx < end; idx += 1) {
            const player: Player.Instance = turn_queue[idx];
            const player_score: Player.Score.Instance = player.Score();
            const player_color: Color.HSLA = player.Color();
            this.scores.push({
                score: player_score,
                color: player_color,
            });
        }

        Object.freeze(this.scores);
        Object.freeze(this);
    }

    Arena():
        Arena.Instance
    {
        return this.arena;
    }

    Min_Score():
        Player.Score.Instance
    {
        return 0;
    }

    Max_Score():
        Player.Score.Instance
    {
        return this.max_score;
    }

    Score_Count():
        Player.Score.Count
    {
        return this.scores.length;
    }

    Score_Color(score_index: Player.Score.Index):
        Color.HSLA
    {
        return this.scores[score_index].color;
    }

    Score_Percent(score_index: Player.Score.Index):
        Float
    {
        return this.scores[score_index].score * 100 / this.max_score;
    }

    Current_Score_Index():
        Player.Score.Index | null
    {
        return this.Arena().Current_Turn_Index();
    }

    Player_Index_To_Score_Index(player_index: Player.Index):
        Player.Score.Index
    {
        return this.Arena().Player_Index_To_Turn_Index(player_index);
    }

    Modify(
        {
            score_index_to_decrement,
            score_index_to_increment,
        }: {
            score_index_to_decrement: Player.Score.Index,
            score_index_to_increment: Player.Score.Index,
        }
    ):
        void
    {
        this.scores[score_index_to_decrement].score -= 1;
        this.scores[score_index_to_increment].score += 1;
    }
}
