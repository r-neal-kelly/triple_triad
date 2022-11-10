import { Float } from "../../../types";

import * as Model from "../../../model";

import * as Event from "../../event";
import { Component } from "../../component";
import { Component_Styles } from "../../component";
import { Game_Measurements } from "../../game";
import { Arena } from "../../arena";
import { Board } from "../../board";
import { Cells } from "../cells";
import { Cell } from "../cell";

type Left_Props = {
    model: Model.Turn_Results.Step.Instance;
    parent: Cell;
    event_grid: Event.Grid;
    index: Model.Board.Cell.Index;
}

export class Left extends Component<Left_Props>
{
    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Cells().Board();
    }

    Cells():
        Cells
    {
        return this.Cell().Cells();
    }

    Cell():
        Cell
    {
        return this.Parent();
    }

    Index():
        Model.Board.Cell.Index
    {
        return this.props.index;
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Side_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Side_Height();
    }

    Font_Size():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Side_Font_Size();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Turn_Results.Step.Instance = this.Model();

        let text: string;
        if (model.same.left) {
            if (model.plus.left) {
                // ⩱ ⩲
                text = `⩲`;
            } else {
                text = `=`;
            }
        } else if (model.plus.left) {
            text = `+`;
        } else {
            text = ``;
        }

        if (text.length > 0) {
            return (
                <div
                    className={`Left`}
                >
                    {text}
                </div>
            );
        } else {
            return null;
        }
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            overflowX: `hidden`,
            overflowY: `hidden`,

            gridColumn: `1 / span 1`,
            gridRow: `3 / span 1`,
            alignSelf: `center`,
            justifySelf: `start`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,

            color: `white`,
            fontSize: `${this.Font_Size()}px`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }
}
