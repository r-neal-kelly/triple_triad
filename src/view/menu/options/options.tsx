import { Float } from "../../../types";

import * as Model from "../../../model";

import * as Event from "../../event";
import { Component } from "../../component";
import { Component_Styles } from "../../component";

import { Menu } from "../../menu";
import { Menu_Measurements } from "../../menu";
import * as Content from "./content";
import * as Panel from "./panel";

type Options_Props = {
    model: Model.Menu.Options;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Options extends Component<Options_Props>
{
    private content: Content.Instance | null = null;
    private panel: Panel.Instance | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Content():
        Content.Instance
    {
        return this.Try_Object(this.content);
    }

    Panel():
        Panel.Instance
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
        return this.Measurements().Options_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Options_Height();
    }

    Border_Width():
        Float
    {
        return this.Measurements().Options_Border_Width();
    }

    Padding():
        Float
    {
        return this.Measurements().Options_Padding();
    }

    Row_Gap():
        Float
    {
        return this.Measurements().Options_Row_Gap();
    }

    Column_Gap():
        Float
    {
        return this.Measurements().Options_Column_Gap();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Options`}
            >
                <Content.Instance
                    ref={ref => this.content = ref}

                    model={this.Model().Data()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Panel.Instance
                    ref={ref => this.panel = ref}

                    model={this.Model().Data()}
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
                ${measurements.Options_Content_Height()}px
                ${measurements.Options_Panel_Height()}px
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

            backgroundColor: `rgba(0, 0, 0, 0.8)`,

            fontSize: `1.8em`,
        });
    }
}
