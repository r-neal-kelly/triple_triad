import { Count } from "../../types";
import { Index } from "../../types";

import { Assert } from "../../utils";
import { Random_Boolean } from "../../utils";
import { Random_Integer_Exclusive } from "../../utils";

import * as Enum from "../enum";
import * as Card from "../card";
import * as Rules from "../rules";
import * as Arena from "../arena";
import * as Player from "../player";
import * as Stake from "../stake";
import * as Turn_Results from "../turn_results";

import * as Row from "./row";
import * as Column from "./column";
import * as Cell from "./cell";
import { Wall } from "./wall";
import * as Defense from "./defense";

/* Contains claims actively in play. */
export class Instance
{
    private arena: Arena.Instance;
    private cells: Array<Cell.Instance>;

    constructor(
        {
            arena,
            cells,
        }: {
            arena: Arena.Instance,
            cells?: Array<Cell.Instance>,
        },
    )
    {
        this.arena = arena;
        this.cells = [];
        if (cells != null) {
            if (cells.length !== this.Cell_Count()) {
                throw new Error(`'cells' must have a length of ${this.Cell_Count()}.`);
            } else {
                for (let idx = 0, end = cells.length; idx < end; idx += 1) {
                    this.cells.push(cells[idx].Clone());
                }
            }
        } else {
            for (let idx = 0, end = this.Cell_Count(); idx < end; idx += 1) {
                this.cells.push(new Cell.Instance());
            }
        }

        Object.freeze(this);
    }

    Clone():
        Instance
    {
        return new Instance({
            arena: this.arena,
            cells: this.cells,
        });
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

    Row_Count():
        Row.Count
    {
        return this.Rules().Row_Count();
    }

    Column_Count():
        Column.Count
    {
        return this.Rules().Column_Count();
    }

    Cell_Count():
        Cell.Count
    {
        return this.Rules().Cell_Count();
    }

    Cell(cell_index: Cell.Index):
        Cell.Instance
    {
        if (cell_index >= 0 && cell_index < this.cells.length) {
            return this.cells[cell_index];
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Cells():
        Array<Cell.Instance>
    {
        return Array.from(this.cells);
    }

    Coordinates(cell_index: Cell.Index):
        {
            row_index: Row.Index,
            column_index: Column.Index,
        }
    {
        Assert(
            cell_index != null &&
            cell_index >= 0 &&
            cell_index < this.Cell_Count()
        );

        const column_count = this.Column_Count();

        return ({
            row_index: Math.floor(cell_index / column_count),
            column_index: cell_index % column_count,
        });
    }

    Step_Count(
        from_cell_index: Cell.Index,
        to_cell_index: Cell.Index,
    ):
        Turn_Results.Step.Count
    {
        const { row_index: from_row_index, column_index: from_column_index } =
            this.Coordinates(from_cell_index);
        const { row_index: to_row_index, column_index: to_column_index } =
            this.Coordinates(to_cell_index);

        const row_difference: Row.Count = to_row_index > from_row_index ?
            to_row_index - from_row_index :
            from_row_index - to_row_index;

        const column_difference: Column.Count = to_column_index > from_column_index ?
            to_column_index - from_column_index :
            from_column_index - to_column_index;

        return row_difference + column_difference;
    }

    Left_Of(cell_index: Cell.Index):
        Cell.Instance | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== 0) {
                return this.Cell(cell_index - 1);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Top_Of(cell_index: Cell.Index):
        Cell.Instance | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index >= column_count) {
                return this.Cell(cell_index - column_count);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Right_Of(cell_index: Cell.Index):
        Cell.Instance | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== column_count - 1) {
                return this.Cell(cell_index + 1);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Bottom_Of(cell_index: Cell.Index):
        Cell.Instance | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - column_count) {
                return this.Cell(cell_index + column_count);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Left_Index_Of(cell_index: Cell.Index):
        Cell.Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== 0) {
                return cell_index - 1;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Top_Index_Of(cell_index: Cell.Index):
        Cell.Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index >= column_count) {
                return cell_index - column_count;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Right_Index_Of(cell_index: Cell.Index):
        Cell.Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== column_count - 1) {
                return cell_index + 1;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Bottom_Index_Of(cell_index: Cell.Index):
        Cell.Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.cells.length) {
            const column_count = this.Column_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - column_count) {
                return cell_index + column_count;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Defense_Of(stake: Stake.Instance, in_cell_index: Cell.Index):
        Defense.Instance
    {
        const card: Card.Instance = stake.Card();

        let min_defense: Defense.Min = Number.MAX_VALUE;
        let max_defense: Defense.Max = 0;
        let defense_count: Defense.Count = 0;
        let defense_sum: number = 0;

        for (const { cell_or_wall, card_value } of [
            {
                cell_or_wall: this.Left_Of(in_cell_index),
                card_value: card.Left(),
            },
            {
                cell_or_wall: this.Top_Of(in_cell_index),
                card_value: card.Top(),
            },
            {
                cell_or_wall: this.Right_Of(in_cell_index),
                card_value: card.Right(),
            },
            {
                cell_or_wall: this.Bottom_Of(in_cell_index),
                card_value: card.Bottom(),
            },
        ]) {
            if (
                cell_or_wall instanceof Cell.Instance &&
                (cell_or_wall as Cell.Instance).Is_Empty()
            ) {
                if (card_value < min_defense) {
                    min_defense = card_value;
                }
                if (card_value > max_defense) {
                    max_defense = card_value;
                }
                defense_count += 1;
                defense_sum += card_value;
            }
        }

        const defense = defense_count > 0 ?
            (defense_sum - (max_defense - min_defense)) / defense_count :
            Number.MAX_VALUE;

        return defense;
    }

    Defense_Count_Of(cell_index: Cell.Index):
        Defense.Count
    {
        let defense_count: Defense.Count = 0;

        for (const cell_or_wall of [
            this.Left_Of(cell_index),
            this.Top_Of(cell_index),
            this.Right_Of(cell_index),
            this.Bottom_Of(cell_index),
        ]) {
            if (
                cell_or_wall instanceof Cell.Instance &&
                (cell_or_wall as Cell.Instance).Is_Empty()
            ) {
                defense_count += 1;
            }
        }

        return defense_count;
    }

    Claim_Count(player: Player.Instance):
        Player.Claim.Count
    {
        let claim_count: Player.Claim.Count = 0;
        for (const cell of this.cells) {
            if (cell.Is_Occupied() && cell.Claimant() === player) {
                claim_count += 1;
            }
        }

        return claim_count;
    }

    async Place_Current_Player_Selected_Stake(cell_index: Cell.Index):
        Promise<Turn_Results.Steps>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                const current_player: Player.Instance = this.Current_Player();
                const selected_stake: Stake.Instance = current_player.Remove_Selected_Stake();

                return this.Private_Place_Stake(selected_stake, cell_index);
            }
        }
    }

    async Place_Stake(stake: Stake.Instance, cell_index: Cell.Index):
        Promise<Turn_Results.Steps>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                return this.Private_Place_Stake(stake, cell_index);
            }
        }
    }

    private async Private_Place_Stake(stake: Stake.Instance, cell_index: Cell.Index):
        Promise<Turn_Results.Steps>
    {
        this.cells[cell_index] = new Cell.Instance(
            {
                stake: stake,
                claimant: stake.Origin(),
            },
        );

        const turn_results: Turn_Results.Instance = new Turn_Results.Instance();
        await this.Evaluate_Cell(cell_index, turn_results);

        return turn_results.Steps();
    }

    /*
        This updates adjacent cards by evaluating the rules
        when a card is placed in a particular cell_index.
        It recursively calls itself for other cards in cell_indices
        that have already been placed, but only when a combo occurs.
    */
    private async Evaluate_Cell(
        cell_index: Cell.Index,
        turn_results: Turn_Results.Instance,
        step_index: Turn_Results.Step.Index = 0,
    ):
        Promise<void>
    {
        const center_index: Cell.Index = cell_index;
        const center_cell: Cell.Instance = this.Cell(center_index);
        const center_card: Card.Instance = center_cell.Stake().Card();
        const center_player: Player.Instance = center_cell.Claimant();
        const center_turn_result: Turn_Results.Step.Instance = turn_results.At(center_index);

        const left_index: Cell.Index | Wall = this.Left_Index_Of(center_index);
        const left_cell: Cell.Instance | Wall = left_index instanceof Wall ?
            left_index :
            this.Cell(left_index);
        let left_claimed: boolean = false;
        let left_combos: boolean = false;

        const top_index: Cell.Index | Wall = this.Top_Index_Of(center_index);
        const top_cell: Cell.Instance | Wall = top_index instanceof Wall ?
            top_index :
            this.Cell(top_index);
        let top_claimed: boolean = false;
        let top_combos: boolean = false;

        const right_index: Cell.Index | Wall = this.Right_Index_Of(center_index);
        const right_cell: Cell.Instance | Wall = right_index instanceof Wall ?
            right_index :
            this.Cell(right_index);
        let right_claimed: boolean = false;
        let right_combos: boolean = false;

        const bottom_index: Cell.Index | Wall = this.Bottom_Index_Of(center_index);
        const bottom_cell: Cell.Instance | Wall = bottom_index instanceof Wall ?
            bottom_index :
            this.Cell(bottom_index);
        let bottom_claimed: boolean = false;
        let bottom_combos: boolean = false;

        if (this.Rules().Same()) {
            const sames: Array<Cell.Index | Wall> = [];

            // first we get all instances of where same can occur, to cache
            // what cards can be claimed, and if the rule has enough counts, including wall
            for (const [cell, index, center_card_value, cell_card_value] of [
                [
                    left_cell,
                    left_index,
                    center_card.Left(),
                    (card: Card.Instance) => card.Right(),
                ],
                [
                    top_cell,
                    top_index,
                    center_card.Top(),
                    (card: Card.Instance) => card.Bottom(),
                ],
                [
                    right_cell,
                    right_index,
                    center_card.Right(),
                    (card: Card.Instance) => card.Left(),
                ],
                [
                    bottom_cell,
                    bottom_index,
                    center_card.Bottom(),
                    (card: Card.Instance) => card.Top(),
                ],
            ] as Array<
                [
                    Cell.Instance | Wall,
                    Cell.Index | Wall,
                    Card.Rank,
                    (card: Card.Instance) => Card.Rank,
                ]
            >) {
                if (
                    cell instanceof Cell.Instance &&
                    cell.Is_Occupied() &&
                    cell.Claimant() !== center_player
                ) {
                    const card: Card.Instance = cell.Stake().Card();
                    if (center_card_value === cell_card_value(card)) {
                        sames.push(index as Cell.Index);
                    }
                } else if (
                    cell instanceof Wall &&
                    this.Rules().Wall()
                ) {
                    if (center_card_value === 10) {
                        sames.push(index as Wall);
                    }
                }
            }

            // we need to have 2 or more indices to satisfy the rules.
            // we also can't proceed if there would be no additional claims, i.e. if there are just walls in here.
            let may_proceed = false;
            if (sames.length >= 2) {
                for (const index of sames) {
                    if (index instanceof Wall === false) {
                        may_proceed = true;
                        break;
                    }
                }
            }

            if (may_proceed) {
                for (const index of sames) {
                    if (index === left_index) {
                        if (index instanceof Wall === false) {
                            left_claimed = true;
                            left_combos = true;
                        }
                        center_turn_result.same.left = true;
                    } else if (index === top_index) {
                        if (index instanceof Wall === false) {
                            top_claimed = true;
                            top_combos = true;
                        }
                        center_turn_result.same.top = true;
                    } else if (index === right_index) {
                        if (index instanceof Wall === false) {
                            right_claimed = true;
                            right_combos = true;
                        }
                        center_turn_result.same.right = true;
                    } else if (index === bottom_index) {
                        if (index instanceof Wall === false) {
                            bottom_claimed = true;
                            bottom_combos = true;
                        }
                        center_turn_result.same.bottom = true;
                    }
                }
            }
        }

        if (this.Rules().Plus()) {
            const sums: { [index: Card.Rank]: Array<Cell.Index | Wall> } = {};

            // first we get all instances of where plus can occur, to cache
            // what cards can be claimed, and if the rule has enough counts, including wall
            for (const [cell, index, center_card_value, cell_card_value] of [
                [
                    left_cell,
                    left_index,
                    center_card.Left(),
                    (card: Card.Instance) => card.Right(),
                ],
                [
                    top_cell,
                    top_index,
                    center_card.Top(),
                    (card: Card.Instance) => card.Bottom(),
                ],
                [
                    right_cell,
                    right_index,
                    center_card.Right(),
                    (card: Card.Instance) => card.Left(),
                ],
                [
                    bottom_cell,
                    bottom_index,
                    center_card.Bottom(),
                    (card: Card.Instance) => card.Top(),
                ],
            ] as Array<
                [
                    Cell.Instance | Wall,
                    Cell.Index | Wall,
                    Card.Rank,
                    (card: Card.Instance) => Card.Rank,
                ]
            >) {
                if (
                    cell instanceof Cell.Instance &&
                    cell.Is_Occupied() &&
                    cell.Claimant() !== center_player
                ) {
                    const card: Card.Instance = cell.Stake().Card();
                    const sum = center_card_value + cell_card_value(card);
                    if (sums[sum] == null) {
                        sums[sum] = [];
                    }
                    sums[sum].push(index as Cell.Index);
                } else if (
                    cell instanceof Wall &&
                    this.Rules().Wall()
                ) {
                    const sum = center_card_value + 10;
                    if (sums[sum] == null) {
                        sums[sum] = [];
                    }
                    sums[sum].push(index as Wall);
                }
            }

            // we remove any that does not include 2 or more indices, which satisfies the rules.
            // we also remove any that would result in no additional claims, i.e. if it just matches walls.
            const sum_array: Array<Array<Cell.Index | Wall>> = Object.values(sums).filter(function (
                sum: Array<Cell.Index | Wall>,
            ):
                boolean
            {
                if (sum.length >= 2) {
                    for (const index of sum) {
                        if (index instanceof Wall === false) {
                            return true;
                        }
                    }

                    return false;
                } else {
                    return false;
                }
            });

            for (const sum of sum_array) {
                for (const index of sum) {
                    if (index === left_index) {
                        if (index instanceof Wall === false) {
                            left_claimed = true;
                            left_combos = true;
                        }
                        center_turn_result.plus.left = true;
                    } else if (index === top_index) {
                        if (index instanceof Wall === false) {
                            top_claimed = true;
                            top_combos = true;
                        }
                        center_turn_result.plus.top = true;
                    } else if (index === right_index) {
                        if (index instanceof Wall === false) {
                            right_claimed = true;
                            right_combos = true;
                        }
                        center_turn_result.plus.right = true;
                    } else if (index === bottom_index) {
                        if (index instanceof Wall === false) {
                            bottom_claimed = true;
                            bottom_combos = true;
                        }
                        center_turn_result.plus.bottom = true;
                    }
                }
            }
        }

        if (
            left_cell instanceof Cell.Instance &&
            left_cell.Is_Occupied() &&
            left_cell.Claimant() !== center_player
        ) {
            const left_card: Card.Instance = left_cell.Stake().Card();
            if (center_card.Left() > left_card.Right()) {
                left_claimed = true;
            }
        }
        if (
            top_cell instanceof Cell.Instance &&
            top_cell.Is_Occupied() &&
            top_cell.Claimant() !== center_player
        ) {
            const top_card: Card.Instance = top_cell.Stake().Card();
            if (center_card.Top() > top_card.Bottom()) {
                top_claimed = true;
            }
        }
        if (
            right_cell instanceof Cell.Instance &&
            right_cell.Is_Occupied() &&
            right_cell.Claimant() !== center_player
        ) {
            const right_card: Card.Instance = right_cell.Stake().Card();
            if (center_card.Right() > right_card.Left()) {
                right_claimed = true;
            }
        }
        if (
            bottom_cell instanceof Cell.Instance &&
            bottom_cell.Is_Occupied() &&
            bottom_cell.Claimant() !== center_player
        ) {
            const bottom_card: Card.Instance = bottom_cell.Stake().Card();
            if (center_card.Bottom() > bottom_card.Top()) {
                bottom_claimed = true;
            }
        }

        if (left_claimed) {
            this.cells[left_index as Cell.Index] = new Cell.Instance(
                {
                    stake: (left_cell as Cell.Instance).Stake(),
                    claimant: center_player,
                },
            );

            const left_turn_result: Turn_Results.Step.Instance =
                turn_results.At(left_index as Cell.Index);
            left_turn_result.index = step_index + 1;
            left_turn_result.direction =
                Enum.Direction.LEFT;
            left_turn_result.old_claimant =
                (left_cell as Cell.Instance).Claimant();
        }
        if (top_claimed) {
            this.cells[top_index as Cell.Index] = new Cell.Instance(
                {
                    stake: (top_cell as Cell.Instance).Stake(),
                    claimant: center_player,
                },
            );

            const top_turn_result: Turn_Results.Step.Instance =
                turn_results.At(top_index as Cell.Index);
            top_turn_result.index = step_index + 1;
            top_turn_result.direction =
                Enum.Direction.TOP;
            top_turn_result.old_claimant =
                (top_cell as Cell.Instance).Claimant();
        }
        if (right_claimed) {
            this.cells[right_index as Cell.Index] = new Cell.Instance(
                {
                    stake: (right_cell as Cell.Instance).Stake(),
                    claimant: center_player,
                },
            );

            const right_turn_result: Turn_Results.Step.Instance =
                turn_results.At(right_index as Cell.Index);
            right_turn_result.index = step_index + 1;
            right_turn_result.direction =
                Enum.Direction.RIGHT;
            right_turn_result.old_claimant =
                (right_cell as Cell.Instance).Claimant();
        }
        if (bottom_claimed) {
            this.cells[bottom_index as Cell.Index] = new Cell.Instance(
                {
                    stake: (bottom_cell as Cell.Instance).Stake(),
                    claimant: center_player,
                },
            );

            const bottom_turn_result: Turn_Results.Step.Instance =
                turn_results.At(bottom_index as Cell.Index);
            bottom_turn_result.index = step_index + 1;
            bottom_turn_result.direction =
                Enum.Direction.BOTTOM;
            bottom_turn_result.old_claimant =
                (bottom_cell as Cell.Instance).Claimant();
        }

        if (this.Rules().Combo()) {
            if (step_index > 0) {
                if (left_claimed || top_claimed || right_claimed || bottom_claimed) {
                    center_turn_result.combo = true;
                }
            }

            const cell_indices_to_combo: Array<Cell.Index> = [];
            if (left_combos) {
                cell_indices_to_combo.push(left_index as Cell.Index);
            }
            if (top_combos) {
                cell_indices_to_combo.push(top_index as Cell.Index);
            }
            if (right_combos) {
                cell_indices_to_combo.push(right_index as Cell.Index);
            }
            if (bottom_combos) {
                cell_indices_to_combo.push(bottom_index as Cell.Index);
            }

            for (const cell_index_to_combo of cell_indices_to_combo) {
                await this.Evaluate_Cell(cell_index_to_combo, turn_results, step_index + 1);
            }
        }
    }

    async Choose_Stake_And_Cell(computer_player: Player.Computer):
        Promise<{
            stake_index: Stake.Index,
            cell_index: Cell.Index,
        }>
    {
        // if the 'open' rule is in play, we can actually let this part look at all the other player's cards
        // to help choose which stake a computer_player will play. however, we're avoiding that altogether
        // for now for the sake of simplicity.

        class Choices
        {
            private placements: { [index: Player.Claim.Delta]: Placements };

            constructor()
            {
                this.placements = {};
            }

            Add(
                claim_delta: Player.Claim.Delta,
                stake_index: Stake.Index,
                cell_index: Cell.Index,
            ):
                void
            {
                if (this.placements[claim_delta] == null) {
                    this.placements[claim_delta] = new Placements();
                }

                this.placements[claim_delta].Push(stake_index, cell_index);
            }

            Claim_Deltas():
                Array<Player.Claim.Delta>
            {
                return Object.keys(this.placements).map(function (value: string):
                    Player.Claim.Delta
                {
                    return parseInt(value) as Player.Claim.Delta;
                }).sort(function (a: Player.Claim.Delta, b: Player.Claim.Delta):
                    number
                {
                    return a - b;
                });
            }

            Min_Claim_Delta():
                Player.Claim.Delta
            {
                const claim_deltas = this.Claim_Deltas();
                if (claim_deltas.length < 1) {
                    throw new Error(`Has no claim_deltas.`);
                } else {
                    return Math.min(...claim_deltas);
                }
            }

            Max_Claim_Delta():
                Player.Claim.Delta
            {
                const claim_deltas = this.Claim_Deltas();
                if (claim_deltas.length < 1) {
                    throw new Error(`Has no claim_deltas.`);
                } else {
                    return Math.max(...claim_deltas);
                }
            }

            Placements(claim_delta: Player.Claim.Delta):
                Placements
            {
                if (this.placements[claim_delta] == null) {
                    throw new Error(`Has no placements with a 'claim_delta' of ${claim_delta}.`);
                } else {
                    return this.placements[claim_delta];
                }
            }

            Min_Claim_Placements():
                Placements
            {
                return this.placements[this.Min_Claim_Delta()];
            }

            Max_Claim_Placements():
                Placements
            {
                return this.placements[this.Max_Claim_Delta()];
            }
        }

        class Placements
        {
            private stake_indices: Array<Stake.Index>;
            private cell_indices: Array<Cell.Index>;

            constructor()
            {
                this.stake_indices = [];
                this.cell_indices = [];
            }

            Push(
                stake_index: Stake.Index,
                cell_index: Cell.Index,
            ):
                void
            {
                this.stake_indices.push(stake_index);
                this.cell_indices.push(cell_index);
            }

            Count():
                Count
            {
                return this.stake_indices.length;
            }

            Random():
                {
                    stake_index: Stake.Index,
                    cell_index: Cell.Index,
                }
            {
                const index: Index = Random_Integer_Exclusive(0, this.stake_indices.length);

                return (
                    {
                        stake_index: this.stake_indices[index],
                        cell_index: this.cell_indices[index],
                    }
                );
            }

            Filter_By_Best_Defense(board: Instance, player: Player.Instance):
                Placements
            {
                let results = new Placements();

                let best_defense: number = 0;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];

                    const defense = board.Defense_Of(player.Stake(stake_index), cell_index);
                    if (defense > best_defense) {
                        best_defense = defense;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense === best_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Worst_Defense(board: Instance, player: Player.Instance):
                Placements
            {
                let results = new Placements();

                let worst_defense: number = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];

                    const defense = board.Defense_Of(player.Stake(stake_index), cell_index);
                    if (defense < worst_defense) {
                        worst_defense = defense;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense === worst_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Biggest_Defense(board: Instance):
                Placements
            {
                let results = new Placements();

                let biggest_defense: number = -1;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];

                    const defense_count = board.Defense_Count_Of(cell_index);
                    if (defense_count > biggest_defense) {
                        biggest_defense = defense_count;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense_count === biggest_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Smallest_Defense(board: Instance):
                Placements
            {
                let results = new Placements();

                let smallest_defense: number = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];

                    const defense_count = board.Defense_Count_Of(cell_index);
                    if (defense_count < smallest_defense) {
                        smallest_defense = defense_count;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense_count === smallest_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Most_Value(player: Player.Instance):
                Placements
            {
                let results = new Placements();

                let most_value = 0;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];
                    const card: Card.Instance = player.Stake(stake_index).Card();

                    const value_sum = card.Left() + card.Top() + card.Right() + card.Bottom();
                    if (value_sum > most_value) {
                        most_value = value_sum;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (value_sum === most_value) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Least_Value(player: Player.Instance):
                Placements
            {
                let results = new Placements();

                let least_value = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake.Index = this.stake_indices[idx];
                    const cell_index: Cell.Index = this.cell_indices[idx];
                    const card: Card.Instance = player.Stake(stake_index).Card();

                    const value_sum = card.Left() + card.Top() + card.Right() + card.Bottom();
                    if (value_sum < least_value) {
                        least_value = value_sum;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (value_sum === least_value) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }
        };

        // we need to figure out what stakes in which cells have the greatest increase in claims.
        // then we can determine if this computer_player will want to play offensively or defensively.
        const current_claim_count: Player.Claim.Count = this.Claim_Count(computer_player);
        const choices: Choices = new Choices();
        for (const [cell_index, cell] of this.cells.entries()) {
            if (cell.Is_Empty()) {
                for (const [stake_index, stake] of computer_player.Stakes().entries()) {
                    const new_board = this.Clone();
                    await new_board.Place_Stake(stake, cell_index);

                    const claim_delta = new_board.Claim_Count(computer_player) - current_claim_count;
                    choices.Add(claim_delta, stake_index, cell_index);
                }
            }
        }

        const max_claim_delta = choices.Max_Claim_Delta();
        if (max_claim_delta > 1) {
            // offensive mode
            // claim as many cards on the board as possible with the least valuable card
            const max_claim_placements = choices.Max_Claim_Placements();
            const best_defense_placements = max_claim_placements.Filter_By_Best_Defense(this, computer_player);
            const least_value_placements = best_defense_placements.Filter_By_Least_Value(computer_player);

            return least_value_placements.Random();
        } else {
            // defensive mode
            const min_claim_placements = choices.Min_Claim_Placements();
            const biggest_defense_placements = min_claim_placements.Filter_By_Biggest_Defense(this);
            if (Random_Boolean() && this.Defense_Count_Of(biggest_defense_placements.Random().cell_index) >= 2) {
                // bait mode
                // place the least valuable yet easily re-claimable card on the board
                const worst_defense_placements = biggest_defense_placements.Filter_By_Worst_Defense(this, computer_player);
                const least_value_placements = worst_defense_placements.Filter_By_Least_Value(computer_player);

                return least_value_placements.Random();
            } else {
                // turtle mode
                // place the most defensible yet least valuable card on the board
                const smallest_defense_placements = min_claim_placements.Filter_By_Smallest_Defense(this);
                const best_defense_placements = smallest_defense_placements.Filter_By_Best_Defense(this, computer_player);
                const least_value_placements = best_defense_placements.Filter_By_Least_Value(computer_player);

                return least_value_placements.Random();
            }
        }
    }

    Current_Player():
        Player.Instance
    {
        return this.Arena().Current_Player();
    }

    Current_Player_Index():
        Player.Index
    {
        return this.Arena().Current_Player_Index();
    }

    Is_On_Human_Turn():
        boolean
    {
        return this.Arena().Is_On_Human_Turn();
    }

    Is_On_Computer_Turn():
        boolean
    {
        return this.Arena().Is_On_Computer_Turn();
    }

    Is_Cell_Selectable(cell_index: Cell.Index):
        boolean
    {
        if (this.Arena().Is_Game_Over()) {
            return false;
        } else {
            return this.Current_Player().Has_Selected_Stake() && this.Cell(cell_index).Is_Empty();
        }
    }
}
