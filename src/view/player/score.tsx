import { Float } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Bumper } from "./bumper";

type Score_Props = {
    model: Model.Player.Instance;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Score extends Component<Score_Props>
{
    Arena():
        Arena
    {
        return this.Player_Bumper().Arena();
    }

    Player_Bumper():
        Bumper
    {
        return this.Parent();
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
        return this.Measurements().Player_Score_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Score_Height();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Player_Score_Padding_Left_Right();
    }

    Padding_Top_Bottom():
        Float
    {
        return this.Measurements().Player_Score_Padding_Top_Bottom();
    }

    Font_Size():
        Float
    {
        return this.Measurements().Player_Score_Font_Size();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Score`}
            >
                {
                    this.Model().Score()
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            padding: `
                ${this.Padding_Top_Bottom()}px
                ${this.Padding_Left_Right()}px
            `,

            alignSelf: `center`,
            justifySelf: `center`,

            overflowX: `hidden`,
            overflowY: `hidden`,

            color: `white`,
            fontSize: `${this.Font_Size()}px`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const player_index: Model.Player.Index = this.Index();

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
