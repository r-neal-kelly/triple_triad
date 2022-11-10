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

type Center_Props = {
    model: Model.Turn_Results.Step.Instance;
    parent: Cell;
    event_grid: Event.Grid;
    index: Model.Board.Cell.Index;
}

export class Center extends Component<Center_Props>
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
        return this.Measurements().Board_Cell_Popup_Center_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Center_Height();
    }

    Margin_Left_Right():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Center_Margin_Left_Right();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Center_Padding_Left_Right();
    }

    Font_Size():
        Float
    {
        return this.Measurements().Board_Cell_Popup_Center_Font_Size();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Turn_Results.Step.Instance = this.Model();

        if (model.combo) {
            return (
                <div
                    className={`Center`}
                >
                    <div>COMBO</div>
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
            margin: `0px ${this.Margin_Left_Right()}px`,
            padding: `0px ${this.Padding_Left_Right()}px`,

            overflowX: `hidden`,
            overflowY: `hidden`,

            gridColumn: `2 / span 3`,
            gridRow: `3 / span 1`,
            alignSelf: `center`,
            justifySelf: `center`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,

            color: `white`,
            fontSize: `${this.Font_Size()}px`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }
}
