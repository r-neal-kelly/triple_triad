import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
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

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Bumper_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Bumper_Height();
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
        const model: Model.Player.Instance = this.Model();
        const color: Model.Color.Instance = this.Model().Color();

        let background_color: string;
        if (model.Arena().Is_Game_Over()) {
            background_color = `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha() * Player.Alpha_Highlight_Multiplier()}
            )`;
        } else {
            background_color = `transparent`;
        }

        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            backgroundColor: background_color,
        });
    }
}
