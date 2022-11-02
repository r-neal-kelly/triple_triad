import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Arena } from "../arena";
import { Board } from "../board";
import { Cell } from "./cell";

type Cells_Props = {
    model: Model.Board;
    parent: Board;
    event_grid: Event.Grid;
}

export class Cells extends Component<Cells_Props>
{
    private cells: Array<Cell | null> = new Array(this.Model().Cell_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    Cell(cell_index: Model.Cell_Index):
        Cell
    {
        return this.Try_Array_Index(this.cells, cell_index);
    }

    Cells():
        Array<Cell>
    {
        return this.Try_Array(this.cells);
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Height();
    }

    Padding():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Padding();
    }

    Grid_Gap():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Grid_Gap();
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    CSS_Padding():
        string
    {
        return `${this.Padding()}px`;
    }

    CSS_Grid_Gap():
        string
    {
        return `${this.Grid_Gap()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Cells`}
            >
                {
                    Array(this.Model().Cell_Count()).fill(null).map((_, cell_index: Model.Cell_Index) =>
                    {
                        return (
                            <Cell
                                key={cell_index}
                                ref={ref => this.cells[cell_index] = ref}

                                parent={this}
                                event_grid={this.Event_Grid()}
                                model={() => this.Model().Cell(cell_index)}
                                index={cell_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const rules: Model.Rules = this.Model().Rules();

        return ({
            display: `grid`,
            gridTemplateColumns: `repeat(${rules.Column_Count()}, 1fr)`,
            gridTemplateRows: `repeat(${rules.Row_Count()}, 1fr)`,
            gridGap: this.CSS_Grid_Gap(),

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            padding: this.CSS_Padding(),
        });
    }
}
