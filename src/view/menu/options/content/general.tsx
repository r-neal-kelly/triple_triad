import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Button } from "../../../common/button";

import { Main } from "../../../main";
import { Exhibitions } from "../../../exhibitions";
import { Menu } from "../../../menu";
import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";
import { Content } from "./content";

type General_Props = {
    model: Model.Options;
    parent: Content;
    event_grid: Event.Grid;
}

export class General extends Component<General_Props>
{
    private title: Title | null = null;
    private display: Display | null = null;

    Main():
        Main
    {
        return this.Menu().Main();
    }

    Menu():
        Menu
    {
        return this.Options().Menu();
    }

    Options():
        Options
    {
        return this.Content().Parent();
    }

    Content():
        Content
    {
        return this.Parent();
    }

    Title():
        Title
    {
        return this.Try_Object(this.title);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Options_Content_Section_Width();
    }

    Padding_Bottom():
        Float
    {
        return this.Measurements().Options_Content_Section_Padding_Bottom();
    }

    Row_Gap():
        Float
    {
        return this.Measurements().Options_Content_Section_Row_Gap();
    }

    Column_Gap():
        Float
    {
        return this.Measurements().Options_Content_Section_Column_Gap();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();

        return (
            <div
                className={`Board`}
            >
                <Title
                    ref={ref => this.title = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Display
                    ref={ref => this.display = ref}

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
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,
            gridGap: `
                ${this.Row_Gap()}px
                ${this.Column_Gap()}px
            `,

            width: `${this.Width()}px`,
            paddingBottom: `${this.Padding_Bottom()}px`,
        });
    }
}

type Title_Props = {
    model: Model.Options;
    parent: General;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
{
    Options():
        Options
    {
        return this.General().Options();
    }

    General():
        General
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Border_Width_Left_Right():
        Float
    {
        return this.Measurements().Options_Content_Section_Title_Border_Width_Left_Right();
    }

    Border_Width_Top_Bottom():
        Float
    {
        return this.Measurements().Options_Content_Section_Title_Border_Width_Top_Bottom();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Title`}
            >
                {`General`}
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,

            gridColumn: `1 / span 1`,
            gridRow: `1 / span 1`,
            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `
                ${this.Border_Width_Top_Bottom()}px
                ${this.Border_Width_Left_Right()}px
            `,
            borderTop: `0px`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            color: `white`,
            fontSize: `110%`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }
}

type Display_Props = {
    model: Model.Options;
    parent: General;
    event_grid: Event.Grid;
}

class Display extends Component<Display_Props>
{
    private display_name: Display_Name | null = null;
    private display_button: Display_Button | null = null;

    General():
        General
    {
        return this.Parent();
    }

    Display_Name():
        Display_Name
    {
        return this.Try_Object(this.display_name);
    }

    Display_Button():
        Display_Button
    {
        return this.Try_Object(this.display_button);
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();

        return (
            <div
                className={`Display`}
            >
                <Display_Name
                    ref={ref => this.display_name = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Display_Button
                    ref={ref => this.display_button = ref}

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
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,

            color: `white`,
            textAlign: `end`,
            whiteSpace: `nowrap`,
        });
    }
}

type Display_Name_Props = {
    model: Model.Options;
    parent: Display;
    event_grid: Event.Grid;
}

class Display_Name extends Component<Display_Name_Props>
{
    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Display_Name`}
            >
                {`Display:`}
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `fit-content`,
            padding: `0 3%`,

            alignSelf: `center`,
            justifySelf: `center`,

            color: `white`,
            textAlign: `end`,
            whiteSpace: `nowrap`,
        });
    }
}

type Display_Button_Props = {
    model: Model.Options;
    parent: Display;
    event_grid: Event.Grid;
}

class Display_Button extends Button<Display_Button_Props>
{
    Main():
        Main
    {
        return this.Menu().Main();
    }

    Menu():
        Menu
    {
        return this.Options().Menu();
    }

    Options():
        Options
    {
        return this.General().Options();
    }

    General():
        General
    {
        return this.Display().General();
    }

    Display():
        Display
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Display_Button`;
    }

    override Text():
        string
    {
        return Model.Enum.Measurement_String(this.Model().Measurement());
    }

    override CSS_Width():
        string
    {
        return `fit-content`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Padding_Left():
        string
    {
        return `3%`;
    }

    override CSS_Padding_Right():
        string
    {
        return `3%`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Toggle_Measurement();
            await this.Refresh();

            if (this.Is_Alive()) {
                const exhibitions: Exhibitions = this.Main().Exhibitions();
                const measurement: Model.Enum.Measurement = this.Model().Measurement();
                await Promise.all(exhibitions.Exhibition_Event_Grids().map(async function (
                    event_grid: Event.Grid,
                ):
                    Promise<void>
                {
                    await event_grid.Send_Event({
                        name_affix: Event.GAME_REMEASURE,
                        name_suffixes: [
                        ],
                        data: {
                            measurement: measurement,
                        } as Event.Game_Remeasure_Data,
                        is_atomic: true,
                    });
                }));
            }
        }
    }
}
