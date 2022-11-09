import * as Enum from "../enum";
import * as Board from "../board";
import * as Step from "./step";
import { Steps } from "./steps";

export class Instance
{
    private steps: { [index: Board.Cell.Index]: Step.Instance };

    constructor()
    {
        this.steps = {};

        Object.freeze(this);
    }

    Freeze():
        void
    {
        for (const step of Object.values(this.steps)) {
            Object.freeze(step.same);
            Object.freeze(step.plus);
            Object.freeze(step);
        }
    }

    At(cell_index: Board.Cell.Index):
        Step.Instance
    {
        if (this.steps[cell_index] == null) {
            this.steps[cell_index] = {
                index: 0,
                cell_index: cell_index,
                direction: Enum.Direction._NONE_,
                old_claimant: null,
                same: {
                    left: false,
                    top: false,
                    right: false,
                    bottom: false,
                },
                plus: {
                    left: false,
                    top: false,
                    right: false,
                    bottom: false,
                },
                combo: false,
            };
        }

        return this.steps[cell_index];
    }

    Steps():
        Steps
    {
        const results: Steps = [];

        const step_hashmap: { [index: Step.Index]: Array<Step.Instance> } = {};
        for (const step of Object.values(this.steps)) {
            if (step_hashmap[step.index] == null) {
                step_hashmap[step.index] = [];
            }
            step_hashmap[step.index].push(step);

            Object.freeze(step.same);
            Object.freeze(step.plus);
            Object.freeze(step);
        }

        const step_array = Object.keys(step_hashmap).map(key => parseInt(key)).sort(
            function (
                key_a: number,
                key_b: number,
            ):
                number
            {
                return key_a - key_b;
            },
        );
        for (const step of step_array) {
            results.push(step_hashmap[step]);
        }

        return results;
    }
}
