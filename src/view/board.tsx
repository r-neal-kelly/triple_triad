import { Float } from "../types";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Game_Measurements } from "./game";
import { Arena } from "./arena";
import { Bumper } from "./board/bumper";
import { Cells } from "./board/cells";

type Board_Props = {
    model: Model.Board.Instance;
    parent: Arena;
    event_grid: Event.Grid;
}

export class Board extends Component<Board_Props>
{
    private bumper: Bumper | null = null;
    private cells: Cells | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Bumper():
        Bumper
    {
        return this.Try_Object(this.bumper);
    }

    Cells():
        Cells
    {
        return this.Try_Object(this.cells);
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Board_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Board_Height();
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

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Board`}
            >
                <Bumper
                    key={`board_bumper`}
                    ref={ref => this.bumper = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
                <Cells
                    key={`board_cells`}
                    ref={ref => this.cells = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
            </div >
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let grid_template_columns: string;
        let grid_template_rows: string;
        if (measurements.Is_Vertical()) {
            grid_template_columns = `
                ${measurements.Board_Bumper_Width()}px 
                ${measurements.Board_Cells_Width()}px
            `;
            grid_template_rows = `auto`;
        } else {
            grid_template_columns = `auto`;
            grid_template_rows = `
                ${measurements.Board_Bumper_Height()}px 
                ${measurements.Board_Cells_Height()}px
            `;
        }

        return ({
            display: `grid`,
            gridTemplateColumns: grid_template_columns,
            gridTemplateRows: grid_template_rows,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            zIndex: `0`,

            backgroundImage: `url("img/boards/pexels-fwstudio-172296.jpg")`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE),
                event_handler: this.On_Player_Place_Stake,
            },
        ]);
    }

    async On_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const turn_result_steps: Model.Turn_Results.Steps =
                await this.Model().Place_Current_Player_Selected_Stake(cell_index);
            if (this.Is_Alive()) {
                for (const turn_result_step of turn_result_steps) {
                    await Promise.all(turn_result_step.map(async function (
                        this: Board,
                        turn_result: Model.Turn_Results.Step.Instance,
                    ):
                        Promise<void>
                    {
                        await this.Send({
                            name_affix: Event.BOARD_CHANGE_CELL,
                            name_suffixes: [
                                turn_result.cell_index.toString(),
                            ],
                            data: {
                                cell_index: turn_result.cell_index,
                                turn_result: turn_result,
                            } as Event.Board_Change_Cell_Data,
                            is_atomic: true,
                        });
                    }, this));

                    if (this.Is_Dead()) {
                        return;
                    }
                }

                this.Send({
                    name_affix: Event.PLAYER_STOP_TURN,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                    } as Event.Player_Stop_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}
