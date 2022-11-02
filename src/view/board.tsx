import { Float } from "../types";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Arena } from "./arena";
import { Bumper } from "./board/bumper";
import { Cells } from "./board/cells";

type Board_Props = {
    model: Model.Board;
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

    Width():
        Float
    {
        return this.Arena().Measurements().Board_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Board_Height();
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

    Refresh_Styles():
        void
    {
        const arena: Arena = this.Arena();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        this.Change_Style(
            `gridTemplateRows`,
            `
                ${arena.Measurements().Board_Bumper_Height()}px 
                ${arena.Measurements().Board_Cells_Height()}px
            `,
        );

        this.Change_Style(
            `backgroundImage`,
            `url("img/boards/pexels-fwstudio-172296.jpg")`,
        );
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `auto`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        this.Refresh_Styles();

        return (
            <div
                className={`Board`}
                style={this.Styles()}
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

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE),
                event_handler: this.On_Player_Place_Stake,
            },
        ]);
    }

    On_Resize(
        {
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: this.Width(),
                    height: this.Height(),
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
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
            const turn_result_steps: Model.Turn_Result_Steps =
                await this.Model().Place_Current_Player_Selected_Stake(cell_index);
            if (this.Is_Alive()) {
                for (const turn_result_step of turn_result_steps) {
                    await Promise.all(turn_result_step.map(async function (
                        this: Board,
                        turn_result: Model.Turn_Result,
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
