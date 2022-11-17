import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Toggle } from "../../../common/toggle";
import { Counter } from "../../../common/counter";

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
    private animation_time_counter: Animation_Time_Counter | null = null;

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

    Display():
        Display
    {
        return this.Try_Object(this.display);
    }

    Animation_Time_Counter():
        Animation_Time_Counter
    {
        return this.Try_Object(this.animation_time_counter);
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
                className={`General`}
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
                <Animation_Time_Counter
                    ref={ref => this.animation_time_counter = ref}

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
            gridTemplateRows: `1fr 1fr 1fr 1fr`,
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
    private name: Display_Name | null = null;
    private toggles: Display_Toggles | null = null;

    General():
        General
    {
        return this.Parent();
    }

    Name():
        Display_Name
    {
        return this.Try_Object(this.name);
    }

    Toggles():
        Display_Toggles
    {
        return this.Try_Object(this.toggles);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
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
                    ref={ref => this.name = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Display_Toggles
                    ref={ref => this.toggles = ref}

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

            width: `100%`,

            gridColumn: `1 / span 1`,
            gridRow: `2 / span 2`,
            alignSelf: `center`,
            justifySelf: `center`,
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
                {`Display`}
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
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }
}

type Display_Toggles_Props = {
    model: Model.Options;
    parent: Display;
    event_grid: Event.Grid;
}

class Display_Toggles extends Component<Display_Toggles_Props>
{
    private best_fit_toggle: Display_Best_Fit_Toggle | null = null;
    private horizontal_toggle: Display_Horizontal_Toggle | null = null;
    private vertical_toggle: Display_Vertical_Toggle | null = null;

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

    Best_Fit_Toggle():
        Display_Best_Fit_Toggle
    {
        return this.Try_Object(this.best_fit_toggle);
    }

    Horizontal_Toggle():
        Display_Horizontal_Toggle
    {
        return this.Try_Object(this.horizontal_toggle);
    }

    Vertical_Toggle():
        Display_Vertical_Toggle
    {
        return this.Try_Object(this.vertical_toggle);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
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
                <Display_Best_Fit_Toggle
                    ref={ref => this.best_fit_toggle = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Display_Horizontal_Toggle
                    ref={ref => this.horizontal_toggle = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Display_Vertical_Toggle
                    ref={ref => this.vertical_toggle = ref}

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
            flexWrap: `wrap`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,
        });
    }
}

type Display_Best_Fit_Toggle_Props = {
    model: Model.Options;
    parent: Display_Toggles;
    event_grid: Event.Grid;
}

class Display_Best_Fit_Toggle extends Toggle<Display_Best_Fit_Toggle_Props>
{
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
        return this.Toggles().Parent();
    }

    Toggles():
        Display_Toggles
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    override Name():
        string
    {
        return `Display_Best_Fit_Toggle`;
    }

    override Text():
        string
    {
        return Model.Enum.Measurement_String(Model.Enum.Measurement.BEST_FIT);
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
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Top():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Right():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Bottom():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Measurement() === Model.Enum.Measurement.BEST_FIT;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Change_Measurement(Model.Enum.Measurement.BEST_FIT);
            await this.Toggles().Refresh();

            if (this.Is_Alive()) {
                await this.Send({
                    name_affix: Event.REMEASURE_EXHIBITIONS,
                    name_suffixes: [
                    ],
                    data: {
                        measurement: this.Model().Measurement(),
                    } as Event.Remeasure_Exhibitions_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Display_Horizontal_Toggle_Props = {
    model: Model.Options;
    parent: Display_Toggles;
    event_grid: Event.Grid;
}

class Display_Horizontal_Toggle extends Toggle<Display_Horizontal_Toggle_Props>
{
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
        return this.Toggles().Parent();
    }

    Toggles():
        Display_Toggles
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    override Name():
        string
    {
        return `Display_Horizontal_Toggle`;
    }

    override Text():
        string
    {
        return Model.Enum.Measurement_String(Model.Enum.Measurement.HORIZONTAL);
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
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Top():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Right():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Bottom():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Measurement() === Model.Enum.Measurement.HORIZONTAL;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Change_Measurement(Model.Enum.Measurement.HORIZONTAL);
            await this.Toggles().Refresh();

            if (this.Is_Alive()) {
                await this.Send({
                    name_affix: Event.REMEASURE_EXHIBITIONS,
                    name_suffixes: [
                    ],
                    data: {
                        measurement: this.Model().Measurement(),
                    } as Event.Remeasure_Exhibitions_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Display_Vertical_Toggle_Props = {
    model: Model.Options;
    parent: Display_Toggles;
    event_grid: Event.Grid;
}

class Display_Vertical_Toggle extends Toggle<Display_Vertical_Toggle_Props>
{
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
        return this.Toggles().Parent();
    }

    Toggles():
        Display_Toggles
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    override Name():
        string
    {
        return `Display_Vertical_Toggle`;
    }

    override Text():
        string
    {
        return Model.Enum.Measurement_String(Model.Enum.Measurement.VERTICAL);
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
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Top():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Right():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override CSS_Padding_Bottom():
        string
    {
        return `${this.Measurements().Options_Content_Section_General_Toggle_Padding()}px`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Measurement() === Model.Enum.Measurement.VERTICAL;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Change_Measurement(Model.Enum.Measurement.VERTICAL);
            await this.Toggles().Refresh();

            if (this.Is_Alive()) {
                await this.Send({
                    name_affix: Event.REMEASURE_EXHIBITIONS,
                    name_suffixes: [
                    ],
                    data: {
                        measurement: this.Model().Measurement(),
                    } as Event.Remeasure_Exhibitions_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Animation_Time_Counter_Props = {
    model: Model.Options;
    parent: General;
    event_grid: Event.Grid;
}

class Animation_Time_Counter extends Counter<Animation_Time_Counter_Props>
{
    override Name():
        string
    {
        return `Animation_Time_Counter`;
    }

    override Text():
        string
    {
        return `Animation Time`;
    }

    override Count():
        string
    {
        return `${this.Model().Animation_Time().toFixed(1)}x`;
    }

    override Can_Decrement():
        boolean
    {
        return this.Model().Can_Decrement_Animation_Time();
    }

    override Can_Increment():
        boolean
    {
        return this.Model().Can_Increment_Animation_Time();
    }

    override CSS_Width():
        string
    {
        return `70%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Can_Decrement_Animation_Time()) {
                model.Decrement_Animation_Time();
                await this.Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Can_Increment_Animation_Time()) {
                model.Increment_Animation_Time();
                await this.Refresh();
            }
        }
    }
}
