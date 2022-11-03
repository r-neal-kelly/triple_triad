import * as Player_And_Score from "../player_and_score";

import { Instance } from "./instance";
import * as Score from "./score";

export class Scores
{
    private top_player_and_scores: Array<Player_And_Score.Instance>;
    private bottom_player_and_scores: Array<Player_And_Score.Instance>;

    constructor(
        {
            players,
        }: {
            players: Array<Instance>,
        },
    )
    {
        const players_and_scores: Array<Player_And_Score.Instance> = [];
        for (const player of players) {
            const player_and_score = {
                player: player,
                score: player.Score(),
            };
            players_and_scores.push(player_and_score);
            Object.freeze(player_and_score);
        }

        let highest_score = Number.MIN_VALUE;
        let highest_scoring_players: Array<Instance> = [];
        for (const { player, score } of players_and_scores) {
            if (score > highest_score) {
                highest_score = score;
                highest_scoring_players = [player];
            } else if (score === highest_score) {
                highest_scoring_players.push(player);
            }
        }

        this.top_player_and_scores = [];
        this.bottom_player_and_scores = [];
        for (const player_and_score of players_and_scores) {
            if (highest_scoring_players.includes(player_and_score.player)) {
                this.top_player_and_scores.push(player_and_score);
            } else {
                this.bottom_player_and_scores.push(player_and_score);
            }
        }

        this.bottom_player_and_scores.sort(function (
            a: Player_And_Score.Instance,
            b: Player_And_Score.Instance,
        ):
            number
        {
            return b.score - a.score;
        });

        Object.freeze(this.top_player_and_scores);
        Object.freeze(this.bottom_player_and_scores);
        Object.freeze(this);
    }

    Top_Count():
        Player_And_Score.Count
    {
        return this.top_player_and_scores.length;
    }

    Top(top_index: Player_And_Score.Index):
        Player_And_Score.Instance
    {
        if (top_index == null || top_index < 0 || top_index >= this.Top_Count()) {
            throw new Error(`Invalid top_index: ${top_index}.`);
        } else {
            return this.top_player_and_scores[top_index];
        }
    }

    Bottom_Count():
        Player_And_Score.Count
    {
        return this.bottom_player_and_scores.length;
    }

    Bottom(bottom_index: Player_And_Score.Index):
        Player_And_Score.Instance
    {
        if (bottom_index == null || bottom_index < 0 || bottom_index >= this.Bottom_Count()) {
            throw new Error(`Invalid bottom_index: ${bottom_index}.`);
        } else {
            return this.bottom_player_and_scores[bottom_index];
        }
    }

    Highest_Score():
        Score.Instance
    {
        return this.top_player_and_scores[0].score;
    }

    Lowest_Score():
        Score.Instance
    {
        if (this.Bottom_Count() > 0) {
            return this.bottom_player_and_scores[this.Bottom_Count() - 1].score;
        } else {
            return this.top_player_and_scores[0].score;
        }
    }

    Has_Winner():
        boolean
    {
        return this.Top_Count() === 1;
    }

    Has_Losers():
        boolean
    {
        return this.Has_Winner();
    }

    Has_Draws():
        boolean
    {
        return !this.Has_Winner();
    }

    Has_Non_Draws():
        boolean
    {
        return this.Has_Draws() && this.Bottom_Count() > 0;
    }

    Winner():
        Player_And_Score.Instance
    {
        if (this.Has_Winner()) {
            return this.top_player_and_scores[0];
        } else {
            throw new Error(`There is no winner.`);
        }
    }

    Losers():
        Array<Player_And_Score.Instance>
    {
        if (this.Has_Losers()) {
            return this.bottom_player_and_scores;
        } else {
            throw new Error(`There are no losers.`);
        }
    }

    Draws():
        Array<Player_And_Score.Instance>
    {
        if (this.Has_Draws()) {
            return this.top_player_and_scores;
        } else {
            throw new Error(`There are no draws.`);
        }
    }

    Non_Draws():
        Array<Player_And_Score.Instance>
    {
        if (this.Has_Non_Draws()) {
            return this.bottom_player_and_scores;
        } else {
            throw new Error(`There are no non-draws.`);
        }
    }
}
