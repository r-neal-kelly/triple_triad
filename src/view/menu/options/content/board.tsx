import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Counter } from "../../../common/counter";

import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";
import { Content } from "./content";

type Board_Props = {
    model: Model.Options;
    parent: Content;
    event_grid: Event.Grid;
}

export class Board extends Component<Board_Props>
{
    private title: Title | null = null;
    private row_counter: Row_Counter | null = null;
    private column_counter: Column_Counter | null = null;

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

    Row_Counter():
        Row_Counter
    {
        return this.Try_Object(this.row_counter);
    }

    Column_Counter():
        Column_Counter
    {
        return this.Try_Object(this.column_counter);
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
                <Row_Counter
                    ref={ref => this.row_counter = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Column_Counter
                    ref={ref => this.column_counter = ref}

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
    parent: Board;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
{
    Board():
        Board
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
                {`Board`}
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

type Row_Counter_Props = {
    model: Model.Options;
    parent: Board;
    event_grid: Event.Grid;
}

class Row_Counter extends Counter<Row_Counter_Props>
{
    Options():
        Options
    {
        return this.Board().Options();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Row_Counter`;
    }

    override Text():
        string
    {
        return `Rows`;
    }

    override Count():
        string
    {
        return this.Model().Rules().Row_Count().toString();
    }

    override Can_Decrement():
        boolean
    {
        return this.Model().Rules().Can_Decrement_Row_Count();
    }

    override Can_Increment():
        boolean
    {
        return this.Model().Rules().Can_Increment_Row_Count();
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

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Rules().Can_Decrement_Row_Count()) {
                model.Rules().Decrement_Row_Count();
                await this.Options().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Rules().Can_Increment_Row_Count()) {
                model.Rules().Increment_Row_Count();
                await this.Options().Refresh();
            }
        }
    }
}

type Column_Counter_Props = {
    model: Model.Options;
    parent: Board;
    event_grid: Event.Grid;
}

class Column_Counter extends Counter<Column_Counter_Props>
{
    Options():
        Options
    {
        return this.Board().Options();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Column_Counter`;
    }

    override Text():
        string
    {
        return `Columns`;
    }

    override Count():
        string
    {
        return this.Model().Rules().Column_Count().toString();
    }

    override Can_Decrement():
        boolean
    {
        return this.Model().Rules().Can_Decrement_Column_Count();
    }

    override Can_Increment():
        boolean
    {
        return this.Model().Rules().Can_Increment_Column_Count();
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

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Rules().Can_Decrement_Column_Count()) {
                model.Rules().Decrement_Column_Count();
                await this.Options().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Rules().Can_Increment_Column_Count()) {
                model.Rules().Increment_Column_Count();
                await this.Options().Refresh();
            }
        }
    }
}
