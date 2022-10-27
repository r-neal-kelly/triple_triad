import { Integer } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component, Component_Styles } from "../component";
import { Button } from "../common/button";
import { Toggle } from "../common/toggle";
import { Counter } from "../common/counter";
import { Color } from "../common/color";
import { Menu } from "../menu";

type Options_Props = {
    model: Model.Menu_Options;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Options extends Component<Options_Props>
{
    private row_counter: Row_Counter | null = null;
    private column_counter: Column_Counter | null = null;
    private player_counter: Player_Counter | null = null;
    private player_colors: Array<null> =
        new Array(this.Model().Data().Rules().Player_Count()).fill(null);

    private same_toggle: Same_Toggle | null = null;
    private plus_toggle: Plus_Toggle | null = null;
    private wall_toggle: Wall_Toggle | null = null;
    private combo_toggle: Combo_Toggle | null = null;

    private back_button: Back_Button | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Row_Counter():
        Row_Counter
    {
        if (this.row_counter == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.row_counter;
        }
    }

    Column_Counter():
        Column_Counter
    {
        if (this.column_counter == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.column_counter;
        }
    }

    Player_Counter():
        Player_Counter
    {
        if (this.player_counter == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.player_counter;
        }
    }

    Same_Toggle():
        Same_Toggle
    {
        if (this.same_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.same_toggle;
        }
    }

    Plus_Toggle():
        Plus_Toggle
    {
        if (this.plus_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.plus_toggle;
        }
    }

    Wall_Toggle():
        Wall_Toggle
    {
        if (this.wall_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.wall_toggle;
        }
    }

    Combo_Toggle():
        Combo_Toggle
    {
        if (this.combo_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.combo_toggle;
        }
    }

    Back_Button():
        Back_Button
    {
        if (this.back_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.back_button;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr 1fr`,
            gridTemplateRows: `1fr 1fr 1fr 1fr`,
            gridGap: `3%`,

            width: `90%`,
            height: `90%`,
            margin: `0`,
            padding: `3%`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.8)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Options`}
                style={this.Styles()}
            >
                <Row_Counter
                    ref={ref => this.row_counter = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Column_Counter
                    ref={ref => this.column_counter = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Player_Counter
                    ref={ref => this.player_counter = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <div>
                </div>
                <Same_Toggle
                    ref={ref => this.same_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Plus_Toggle
                    ref={ref => this.plus_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Wall_Toggle
                    ref={ref => this.wall_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Combo_Toggle
                    ref={ref => this.combo_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Back_Button
                    ref={ref => this.back_button = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Board_Options_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Board_Options extends Component<Board_Options_Props>
{
    Options():
        Options
    {
        return this.Parent();
    }
}

class Row_Counter extends Counter
{
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
        Integer
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Row_Count();
    }

    override Can_Decrement():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Can_Decrement_Row_Count();
    }

    override Can_Increment():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Can_Increment_Row_Count();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Rules().Can_Decrement_Row_Count()) {
                model.Data().Rules().Decrement_Row_Count();
                await this.Parent().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Rules().Can_Increment_Row_Count()) {
                model.Data().Rules().Increment_Row_Count();
                await this.Parent().Refresh();
            }
        }
    }
}

class Column_Counter extends Counter
{
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
        Integer
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Column_Count();
    }

    override Can_Decrement():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Can_Decrement_Column_Count();
    }

    override Can_Increment():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Rules().Can_Increment_Column_Count();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Rules().Can_Decrement_Column_Count()) {
                model.Data().Rules().Decrement_Column_Count();
                await this.Parent().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Rules().Can_Increment_Column_Count()) {
                model.Data().Rules().Increment_Column_Count();
                await this.Parent().Refresh();
            }
        }
    }
}

type Player_Options_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Player_Options extends Component<Player_Options_Props>
{
    Options():
        Options
    {
        return this.Parent();
    }
}

class Player_Counter extends Counter
{
    override Name():
        string
    {
        return `Player_Counter`;
    }

    override Text():
        string
    {
        return `Players`;
    }

    override Count():
        Integer
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Player_Count();
    }

    override Can_Decrement():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Can_Decrement_Player_Count();
    }

    override Can_Increment():
        boolean
    {
        const model = this.Model() as Model.Menu_Options;

        return model.Data().Can_Increment_Player_Count();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Can_Decrement_Player_Count()) {
                model.Data().Decrement_Player_Count();
                await this.Parent().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model = this.Model() as Model.Menu_Options;
            if (model.Data().Can_Increment_Player_Count()) {
                model.Data().Increment_Player_Count();
                await this.Parent().Refresh();
            }
        }
    }
}

type Player_Colors_Props = {
    model: Model.Options;
    parent: Player_Options;
    event_grid: Event.Grid;
}

class Player_Colors extends Component<Player_Colors_Props>
{
    Options():
        Options
    {
        return this.Player_Options().Options();
    }

    Player_Options():
        Player_Options
    {
        return this.Parent();
    }
}

type Player_Color_Props = {
    model: Model.Options;
    parent: Player_Colors;
    event_grid: Event.Grid;
    index: Model.Player_Index;
}

class Player_Color extends Color<Player_Color_Props>
{
    Options():
        Options
    {
        return this.Player_Colors().Player_Options().Options();
    }

    Player_Options():
        Player_Options
    {
        return this.Player_Colors().Player_Options();
    }

    Player_Colors():
        Player_Colors
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    override Name():
        string
    {
        return `Player_Color_${this.Index()}`;
    }

    override Color():
        Model.Color
    {
        return this.Model().Player_Color(this.Index());
    }

    override CSS_Width():
        string
    {
        return `calc(100% / ${Model.Options.Max_Player_Count()})`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
    }

    override CSS_Button_Text_Size():
        string
    {
        return `1em`;
    }

    override CSS_Button_Activated_Text_Size():
        string
    {
        return `1em`;
    }

    override async On_Previous(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Select_Previous_Player_Color(this.Index());
            await this.Refresh();
        }
    }

    override async On_Next(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Select_Next_Player_Color(this.Index());
            await this.Refresh();
        }
    }
}

class Same_Toggle extends Toggle
{
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
        return this.Model().Data().Rules().Same();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Same();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Data().Rules().Toggle_Same();
            await this.Parent().Refresh();
        }
    }
}

class Plus_Toggle extends Toggle
{
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
        return this.Model().Data().Rules().Plus();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Plus();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Data().Rules().Toggle_Plus();
            await this.Parent().Refresh();
        }
    }
}

class Wall_Toggle extends Toggle
{
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
        return this.Model().Data().Rules().Wall();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Wall();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Is_Enabled()) {
                this.Model().Data().Rules().Toggle_Wall();
                await this.Parent().Refresh();
            }
        }
    }
}

class Combo_Toggle extends Toggle
{
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
        return this.Model().Data().Rules().Combo();
    }

    override Is_Enabled():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Combo();
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Is_Enabled()) {
                this.Model().Data().Rules().Toggle_Combo();
                await this.Parent().Refresh();
            }
        }
    }
}

class Back_Button extends Button
{
    override Name():
        string
    {
        return `Back_Button`;
    }

    override Text():
        string
    {
        return `Back`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
    }

    override CSS_Text_Color():
        string
    {
        return `white`;
    }

    override CSS_Text_Size():
        string
    {
        return `2em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.OPEN_TOP_MENU,
                name_suffixes: [
                ],
                data: {
                } as Event.Open_Top_Menu_Data,
                is_atomic: true,
            });
        }
    }
}
