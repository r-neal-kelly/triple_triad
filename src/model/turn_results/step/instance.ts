import * as Enum from "../../enum";
import * as Board from "../../board";
import * as Player from "../../player";

import { Index } from "./index";

export type Instance = {
    index: Index,
    cell_index: Board.Cell.Index,
    direction: Enum.Direction,
    old_claimant: Player.Instance | null,
    same: {
        left: boolean,
        top: boolean,
        right: boolean,
        bottom: boolean,
    },
    plus: {
        left: boolean,
        top: boolean,
        right: boolean,
        bottom: boolean,
    },
    combo: boolean,
}
