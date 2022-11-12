import { Float } from "../../../types";

import * as Model from "../../../model";

import * as Event from "../../event";
import { Component } from "../../component";
import { Component_Styles } from "../../component";

import { Menu } from "../../menu";
import { Content as Menu_Content } from "../../menu";
import { Menu_Measurements } from "../../menu";
import { Content } from "./content/content";
import { Panel } from "./panel/panel";

type Help_Props = {
    model: Model.Menu.Help;
    parent: Menu_Content;
    event_grid: Event.Grid;
}

export class Help extends Component<Help_Props>
{
    private content: Content | null = null;
    private panel: Panel | null = null;

    Menu():
        Menu
    {
        return this.Menu_Content().Menu();
    }

    Menu_Content():
        Menu_Content
    {
        return this.Parent();
    }

    Content():
        Content
    {
        return this.Try_Object(this.content);
    }

    Panel():
        Panel
    {
        return this.Try_Object(this.panel);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Menu().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Help_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Help_Height();
    }

    Border_Width():
        Float
    {
        return this.Measurements().Help_Border_Width();
    }

    Padding():
        Float
    {
        return this.Measurements().Help_Padding();
    }

    Row_Gap():
        Float
    {
        return this.Measurements().Help_Row_Gap();
    }

    Column_Gap():
        Float
    {
        return this.Measurements().Help_Column_Gap();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Help`}
            >
                <Content
                    ref={ref => this.content = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Panel
                    ref={ref => this.panel = ref}

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
        const measurements: Menu_Measurements = this.Measurements();

        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `
                ${measurements.Help_Content_Height()}px
                ${measurements.Help_Panel_Height()}px
            `,
            gridGap: `
                ${this.Row_Gap()}px
                ${this.Column_Gap()}px
            `,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,
            padding: `${this.Padding()}px`,

            borderWidth: `${this.Border_Width()}px`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.95)`,

            fontSize: `1.8em`,
        });
    }
}
