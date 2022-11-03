import * as Color from "../color";
import * as Selection from "../selection";
import * as Rules from "../rules";
import * as Arena from "../arena";
import * as Board from "../board";

import { Index } from "./index";
import { Name } from "./name";
import * as Stake from "./stake";
import * as Score from "./score";

/* Contains stakes selected for a player. */
export class Instance
{
    private arena: Arena.Instance;
    private index: Index;
    private name: Name;
    private selection: Selection.Instance;

    private stakes: Array<Stake.Instance>;
    private selected_stake_index: Stake.Index | null;

    constructor(
        {
            arena,
            index,
            name,
            selection,
        }: {
            arena: Arena.Instance,
            index: Index,
            name: Name,
            selection: Selection.Instance,
        },
    )
    {
        this.arena = arena;
        this.index = index;
        this.name = name;
        this.selection = selection;

        this.stakes = [];
        this.selected_stake_index = null;

        for (let idx = 0, end = selection.Card_Count(); idx < end; idx += 1) {
            this.stakes.push(new Stake.Instance({
                origin: this,
                card: selection.Card(idx),
            }));
        }
    }

    Arena():
        Arena.Instance
    {
        return this.arena;
    }

    Rules():
        Rules.Instance
    {
        return this.Arena().Rules();
    }

    Board():
        Board.Instance
    {
        return this.Arena().Board();
    }

    Index():
        Index
    {
        return this.index;
    }

    Name():
        Name
    {
        return this.name;
    }

    Selection():
        Selection.Instance
    {
        return this.selection;
    }

    Color():
        Color.Instance
    {
        return this.Selection().Color();
    }

    Is_Human():
        boolean
    {
        return this.Selection().Is_Of_Human();
    }

    Is_Computer():
        boolean
    {
        return !this.Is_Human();
    }

    Stake_Count():
        Stake.Count
    {
        return this.stakes.length;
    }

    Stake(stake_index: Stake.Index):
        Stake.Instance
    {
        if (stake_index >= 0 && stake_index < this.Stake_Count()) {
            return this.stakes[stake_index];
        } else {
            throw new Error(`Invalid stake_index.`);
        }
    }

    Stakes():
        Array<Stake.Instance>
    {
        return Array.from(this.stakes);
    }

    Has_Stake(stake: Stake.Instance):
        boolean
    {
        return this.stakes.includes(stake);
    }

    Select_Stake(stake_index: Stake.Index | null):
        void
    {
        if (stake_index == null) {
            this.selected_stake_index = null;
        } else if (stake_index >= 0 && stake_index < this.Stake_Count()) {
            this.selected_stake_index = stake_index;
        } else {
            throw new Error(`Invalid stake_index.`);
        }
    }

    Selected_Stake_Index():
        Stake.Index | null
    {
        return this.selected_stake_index;
    }

    Selected_Stake():
        Stake.Instance | null
    {
        if (this.selected_stake_index != null) {
            return this.Stake(this.selected_stake_index);
        } else {
            return null;
        }
    }

    Has_Selected_Stake():
        boolean
    {
        return this.Selected_Stake() != null;
    }

    Remove_Selected_Stake():
        Stake.Instance
    {
        if (this.selected_stake_index != null) {
            const selected_stake: Stake.Instance = this.stakes[this.selected_stake_index];

            if (this.Stake_Count() > 1) {
                for (let idx = this.selected_stake_index + 1, end = this.Stake_Count(); idx < end; idx += 1) {
                    this.stakes[idx - 1] = this.stakes[idx];
                }
            }
            this.stakes.pop();

            this.selected_stake_index = null;

            return selected_stake;
        } else {
            throw new Error(`No selected stake to remove.`);
        }
    }

    Is_On_Turn():
        boolean
    {
        if (this.Arena().Is_Game_Over()) {
            return false;
        } else {
            return this.Arena().Current_Player() === this;
        }
    }

    Score():
        Score.Instance
    {
        return this.Stake_Count() + this.Board().Claim_Count(this);
    }
}
