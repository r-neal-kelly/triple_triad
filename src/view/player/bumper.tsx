import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Player } from "../player";
import { Name } from "./name";
import { Score } from "./score";

type Bumper_Props = {
    model: Model.Player.Instance;
    parent: Player;
    event_grid: Event.Grid;
}

export class Bumper extends Component<Bumper_Props>
{
    private name: Name | null = null;
    private score: Score | null = null;

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Name():
        Name
    {
        return this.Try_Object(this.name);
    }

    Score():
        Score
    {
        return this.Try_Object(this.score);
    }

    Index():
        Model.Player.Index
    {
        return this.Model().Index();
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Player_Bumper_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Bumper_Height();
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
        const model: Model.Player.Instance = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player.Index = this.Index();

        return (
            <div
                className={`Bumper`}
            >
                <Name
                    key={`name_${index}`}
                    ref={ref => this.name = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Score
                    key={`score_${index}`}
                    ref={ref => this.score = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();
        const model: Model.Player.Instance = this.Model();
        const color: Model.Color.HSLA = this.Model().Color();

        let grid_template_columns: string;
        let grid_template_rows: string;
        if (measurements.Is_Vertical()) {
            grid_template_columns = `
                ${measurements.Player_Name_Width()}px
                ${measurements.Player_Score_Width()}px
            `;
            grid_template_rows = `1fr`;
        } else {
            grid_template_columns = `1fr`;
            grid_template_rows = `
                ${measurements.Player_Name_Height()}px
                ${measurements.Player_Score_Height()}px
            `;
        }

        let background_color: string;
        if (model.Arena().Is_Game_Over()) {
            background_color = `hsl(
                ${color.Hue()},
                ${color.Saturation()}%,
                ${color.Lightness()}%,
                ${color.Alpha() * Player.Alpha_Highlight_Multiplier()}
            )`;
        } else {
            background_color = `transparent`;
        }

        return ({
            display: `grid`,
            gridTemplateColumns: grid_template_columns,
            gridTemplateRows: grid_template_rows,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            zIndex: `0`,

            backgroundColor: background_color,
        });
    }
}
