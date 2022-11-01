import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Bumper } from "./bumper";

type Score_Props = {
    model: Model.Player;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Score extends Component<Score_Props>
{
    Player_Bumper():
        Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            color: `white`,
            textAlign: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Score`}
                style={this.Styles()}
            >
                {
                    this.Model().Score()
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_CHANGE_SCORE, player_index.toString()),
                event_handler: this.On_This_Player_Change_Score,
            },
        ]);
    }

    async On_This_Player_Change_Score(
        {
            score_delta,
        }: Event.Player_Change_Score_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const element: HTMLElement =
                this.Some_Element();
            element.textContent =
                (parseInt(element.textContent as string) + score_delta).toString();
        }
    }
}
