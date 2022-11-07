import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Board } from "../board";
import { Score_Bar } from "./score_bar";

type Bumper_Props = {
    model: Model.Board.Instance;
    parent: Board;
    event_grid: Event.Grid;
}

export class Bumper extends Component<Bumper_Props>
{
    private score_bar: Score_Bar | null = null;

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

    Score_Bar():
        Score_Bar
    {
        return this.Try_Object(this.score_bar);
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Bumper`}
            >
                <Score_Bar
                    ref={ref => this.score_bar = ref}

                    model={this.Model().Arena().Score_Bar()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div >
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let padding: string;
        if (measurements.Is_Vertical()) {
            padding = `
            ${measurements.Board_Bumper_Padding()}px
            0px
            ${measurements.Board_Bumper_Padding()}px
            ${measurements.Board_Bumper_Padding()}px
        `;
        } else {
            padding = `
                ${measurements.Board_Bumper_Padding()}px
                ${measurements.Board_Bumper_Padding()}px
                0px
                ${measurements.Board_Bumper_Padding()}px
            `;
        }

        return ({
            width: `100%`,
            height: `100%`,
            padding: padding,
        });
    }
}
