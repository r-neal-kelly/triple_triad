import { Integer } from "../../types";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Button } from "../common/button";
import { Toggle } from "../common/toggle";
import { Counter } from "../common/counter";
import { Menu } from "../menu";

type Options_Props = {
    model: Model.Menu.Options;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Options extends Component<Options_Props>
{
    private player_options: Player_Options | null = null;
    private board_options: Board_Options | null = null;
    private back_button: Back_Button | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Player_Options():
        Player_Options
    {
        return this.Try_Object(this.player_options);
    }

    Board_Options():
        Board_Options
    {
        return this.Try_Object(this.board_options);
    }

    Back_Button():
        Back_Button
    {
        return this.Try_Object(this.back_button);
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Options`}
            >
                <Player_Options
                    ref={ref => this.player_options = ref}

                    model={this.Model().Data()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Board_Options
                    ref={ref => this.board_options = ref}

                    model={this.Model().Data()}
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

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `4fr 5fr 1.5fr`,
            gridGap: `3%`,

            width: `90%`,
            height: `90%`,
            margin: `0`,
            padding: `3vmin`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.8)`,

            fontSize: `1.8em`,
        });
    }
}

type Player_Options_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Player_Options extends Component<Player_Options_Props>
{
    private player_counter: Player_Counter | null = null;
    private player_colors: Player_Colors | null = null;

    Options():
        Options
    {
        return this.Parent();
    }

    Player_Counter():
        Player_Counter
    {
        return this.Try_Object(this.player_counter);
    }

    Player_Colors():
        Player_Colors
    {
        return this.Try_Object(this.player_colors);
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player_Options`}
            >
                <Player_Colors
                    ref={ref => this.player_colors = ref}

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
            gridGap: `3%`,

            width: `100%`,
            height: `100%`,
            margin: `0`,
            padding: `0`,

            backgroundColor: `transparent`,
        });
    }
}

type Player_Counter_Props = {
    model: Model.Options;
    parent: Player_Options;
    event_grid: Event.Grid;
}

class Player_Counter extends Counter<Player_Counter_Props>
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
        return this.Model().Player_Count();
    }

    override Can_Decrement():
        boolean
    {
        return this.Model().Can_Decrement_Player_Count();
    }

    override Can_Increment():
        boolean
    {
        return this.Model().Can_Increment_Player_Count();
    }

    override CSS_Width():
        string
    {
        return `40%`;
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
            if (model.Can_Decrement_Player_Count()) {
                model.Decrement_Player_Count();
                await this.Options().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Can_Increment_Player_Count()) {
                model.Increment_Player_Count();
                await this.Options().Refresh();
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
    private player_colors: Array<Player_Color | null> =
        new Array(this.Model().Player_Count()).fill(null);

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

    Player_Color(player_color_index: Model.Color.Index):
        Player_Color
    {
        return this.Try_Array_Index(this.player_colors, player_color_index);
    }

    Player_Colors():
        Array<Player_Color>
    {
        return this.Try_Array(this.player_colors);
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const player_color_count: Model.Color.Count = model.Player_Color_Count();

        return (
            <div
                className={`Player_Colors`}
            >
                {
                    Array(player_color_count).fill(null).map((
                        _,
                        player_color_index: Model.Color.Index
                    ):
                        JSX.Element =>
                    {
                        return (
                            <Player_Color
                                key={player_color_index}
                                ref={ref => this.player_colors[player_color_index] = ref}

                                model={model}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={player_color_index}
                            />
                        );
                    })
                }
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
            height: `100%`,
            margin: `0`,
            padding: `0`,
        });
    }
}

type Player_Color_Props = {
    model: Model.Options;
    parent: Player_Colors;
    event_grid: Event.Grid;
    index: Model.Player.Index;
}

class Player_Color extends Component<Player_Color_Props>
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
        Model.Player.Index
    {
        return this.props.index;
    }

    Name():
        string
    {
        return `Player_Color_${this.Index()}`;
    }

    Color():
        Model.Color.Instance
    {
        return this.Model().Player_Color(this.Index());
    }

    CSS_Width():
        string
    {
        return `calc(100% / ${Model.Options.Max_Player_Count()})`;
    }

    CSS_Height():
        string
    {
        return `100%`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={this.Name()}
                onClick={event => this.On_Activate(event)}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const color: Model.Color.Instance = this.Color();

        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            margin: `0`,
            padding: `0`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Select_Next_Player_Color(this.Index());
            await this.Options().Refresh();
        }
    }
}

type Board_Options_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Board_Options extends Component<Board_Options_Props>
{
    private row_counter: Row_Counter | null = null;
    private column_counter: Column_Counter | null = null;
    private same_toggle: Same_Toggle | null = null;
    private plus_toggle: Plus_Toggle | null = null;
    private wall_toggle: Wall_Toggle | null = null;
    private combo_toggle: Combo_Toggle | null = null;

    Options():
        Options
    {
        return this.Parent();
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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();

        return (
            <div
                className={`Board_Options`}
            >
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
            gridGap: `3%`,

            width: `100%`,
            height: `100%`,
            margin: `0`,
            padding: `0`,

            backgroundColor: `transparent`,
        });
    }
}

type Row_Counter_Props = {
    model: Model.Options;
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Row_Counter extends Counter<Row_Counter_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        Integer
    {
        return this.Model().Rules().Row_Count();
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
        return `90%`;
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
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Column_Counter extends Counter<Column_Counter_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        Integer
    {
        return this.Model().Rules().Column_Count();
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
        return `90%`;
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

type Same_Toggle_Props = {
    model: Model.Options;
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Same_Toggle extends Toggle<Same_Toggle_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        return `90%`;
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
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Plus_Toggle extends Toggle<Plus_Toggle_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        return `90%`;
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
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Wall_Toggle extends Toggle<Wall_Toggle_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        return `90%`;
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
    parent: Board_Options;
    event_grid: Event.Grid;
}

class Combo_Toggle extends Toggle<Combo_Toggle_Props>
{
    Options():
        Options
    {
        return this.Board_Options().Options();
    }

    Board_Options():
        Board_Options
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
        return `90%`;
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

type Back_Button_Props = {
    model: Model.Menu.Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Back_Button extends Button<Back_Button_Props>
{
    Options():
        Options
    {
        return this.Parent();
    }

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
