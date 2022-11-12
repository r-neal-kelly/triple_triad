import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";

import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";
import { General } from "./general";
import { Player } from "./player";
import { Board } from "./board";
import { Rules } from "./rules";

type Content_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

export class Content extends Component<Content_Props>
{
    private general: General | null = null;
    private player: Player | null = null;
    private board: Board | null = null;
    private rules: Rules | null = null;

    Options():
        Options
    {
        return this.Parent();
    }

    General():
        General
    {
        return this.Try_Object(this.general);
    }

    Player():
        Player
    {
        return this.Try_Object(this.player);
    }

    Board():
        Board
    {
        return this.Try_Object(this.board);
    }

    Rules():
        Rules
    {
        return this.Try_Object(this.rules);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Options_Content_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Options_Content_Height();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Options_Content_Padding_Left_Right();
    }

    Padding_Top_Bottom():
        Float
    {
        return this.Measurements().Options_Content_Padding_Top_Bottom();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Content`}
            >
                <General
                    ref={ref => this.general = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Player
                    ref={ref => this.player = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Board
                    ref={ref => this.board = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Rules
                    ref={ref => this.rules = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `${this.Width()}px`,
            height: `${this.Height()}px`,
            padding: `
                ${this.Padding_Top_Bottom()}px
                ${this.Padding_Left_Right()}px
            `,

            overflowX: `hidden`,
            overflowY: `auto`,
        });
    }
}
