import { Count } from "../../types";

import { Random_Boolean } from "../../utils";
import { Random_Integer_Inclusive } from "../../utils";

import * as Board from "../board";

import { Instance } from "./instance";
import * as Stake from "../stake";

export class Computer extends Instance
{
    async Choose_Stake_And_Cell():
        Promise<{
            selection_indices: Array<Stake.Index>,
            cell_index: Board.Cell.Index,
        }>
    {
        const {
            stake_index,
            cell_index,
        } = await this.Board().Choose_Stake_And_Cell(this);

        // used to give the impression that the ai is choosing a stake. smoothly lands on the stake it selects.
        // we can add other impression algorithms heres and choose them randomly
        const stake_count = this.Stake_Count();
        const selection_indices: Array<Stake.Index> = [stake_index];
        let selection_index: Stake.Index = stake_index;
        let selection_step_count: Count =
            Random_Integer_Inclusive(1, Math.min(stake_count * 1.5, 8)) - 1;
        while (selection_step_count > 0) {
            selection_step_count -= 1;
            if (Random_Boolean()) {
                if (selection_index > 0) {
                    selection_index -= 1;
                } else {
                    selection_index = stake_count - 1;
                }
            } else {
                if (selection_index < stake_count - 1) {
                    selection_index += 1;
                } else {
                    selection_index = 0;
                }
            }
            selection_indices.push(selection_index);
        }

        return ({
            selection_indices: selection_indices.reverse(),
            cell_index,
        });
    }
}
