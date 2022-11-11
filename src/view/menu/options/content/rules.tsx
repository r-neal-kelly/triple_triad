import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Toggle } from "../../../common/toggle";

import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";
import { Content } from "./content";

type Rules_Props = {
    model: Model.Options;
    parent: Content;
    event_grid: Event.Grid;
}

export class Rules extends Component<Rules_Props>
{
    private title: Title | null = null;
    private same_toggle: Same_Toggle | null = null;
    private plus_toggle: Plus_Toggle | null = null;
    private wall_toggle: Wall_Toggle | null = null;
    private combo_toggle: Combo_Toggle | null = null;

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

    Same_Toggle():
        Same_Toggle
    {
        return this.Try_Object(this.same_toggle);
    }

    Plus_Toggle():
        Plus_Toggle
    {
        return this.Try_Object(this.plus_toggle);
    }

    Wall_Toggle():
        Wall_Toggle
    {
        return this.Try_Object(this.wall_toggle);
    }

    Combo_Toggle():
        Combo_Toggle
    {
        return this.Try_Object(this.combo_toggle);
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
                className={`Rules`}
            >
                <Title
                    ref={ref => this.title = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Same_Toggle
                    ref={ref => this.same_toggle = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Plus_Toggle
                    ref={ref => this.plus_toggle = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Wall_Toggle
                    ref={ref => this.wall_toggle = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Combo_Toggle
                    ref={ref => this.combo_toggle = ref}

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
            gridTemplateColumns: `1fr 1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
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
    parent: Rules;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
{
    Rules():
        Rules
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
                {`Rules`}
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,

            gridColumn: `1 / span 2`,
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

type Same_Toggle_Props = {
    model: Model.Options;
    parent: Rules;
    event_grid: Event.Grid;
}

class Same_Toggle extends Toggle<Same_Toggle_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Rules().Content();
    }

    Rules():
        Rules
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Same_Toggle`;
    }

    override Text():
        string
    {
        return `Same`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Rules().Same();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Rules().Can_Toggle_Same();
    }

    override CSS_Width():
        string
    {
        return `100%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Rules().Toggle_Same();
            await this.Options().Refresh();
        }
    }
}

type Plus_Toggle_Props = {
    model: Model.Options;
    parent: Rules;
    event_grid: Event.Grid;
}

class Plus_Toggle extends Toggle<Plus_Toggle_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Rules().Content();
    }

    Rules():
        Rules
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Plus_Toggle`;
    }

    override Text():
        string
    {
        return `Plus`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Rules().Plus();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Rules().Can_Toggle_Plus();
    }

    override CSS_Width():
        string
    {
        return `100%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Rules().Toggle_Plus();
            await this.Options().Refresh();
        }
    }
}

type Wall_Toggle_Props = {
    model: Model.Options;
    parent: Rules;
    event_grid: Event.Grid;
}

class Wall_Toggle extends Toggle<Wall_Toggle_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Rules().Content();
    }

    Rules():
        Rules
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Wall_Toggle`;
    }

    override Text():
        string
    {
        return `Wall`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Rules().Wall();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Rules().Can_Toggle_Wall();
    }

    override CSS_Width():
        string
    {
        return `100%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Is_Enabled()) {
                this.Model().Rules().Toggle_Wall();
                await this.Options().Refresh();
            }
        }
    }
}

type Combo_Toggle_Props = {
    model: Model.Options;
    parent: Rules;
    event_grid: Event.Grid;
}

class Combo_Toggle extends Toggle<Combo_Toggle_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Rules().Content();
    }

    Rules():
        Rules
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Combo_Toggle`;
    }

    override Text():
        string
    {
        return `Combo`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Rules().Combo();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Rules().Can_Toggle_Combo();
    }

    override CSS_Width():
        string
    {
        return `100%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Is_Enabled()) {
                this.Model().Rules().Toggle_Combo();
                await this.Options().Refresh();
            }
        }
    }
}
