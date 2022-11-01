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
    model: Model.Player;
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
        Model.Player_Index
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

    Refresh_Styles():
        void
    {
        const model: Model.Player = this.Model();
        const color: Model.Color = this.Model().Color();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (model.Arena().Is_Game_Over()) {
            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha() * Player.Alpha_Highlight_Multiplier()}
                )`
            );
        } else {
            this.Change_Style(
                `backgroundColor`,
                `transparent`,
            );
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        this.Refresh_Styles();

        return (
            <div
                className={`Bumper`}
                style={this.Styles()}
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

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
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
}
