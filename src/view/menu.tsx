import { Float } from "../types";

import { Percent } from "../utils";
import { Y_Scrollbar_Width } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Button } from "./common/button";

import { Main } from "./main";
import { Top } from "./menu/top";
import * as Options from "./menu/options";
import * as Help from "./menu/help";

export class Menu_Measurements
{
    private width: Float;
    private height: Float;

    private square_button_size: Float;
    private square_button_border_width: Float;
    private square_button_padding: Float;
    private square_button_offset: Float;

    private top_width: Float;
    private top_height: Float;
    private top_title_area_width: Float;
    private top_title_area_height: Float;
    private top_buttons_width: Float;
    private top_buttons_height: Float;

    private options_width: Float;
    private options_height: Float;
    private options_border_width: Float;
    private options_padding: Float;
    private options_row_gap: Float;
    private options_column_gap: Float;
    private options_content_width: Float;
    private options_content_height: Float;
    private options_content_padding_left_right: Float;
    private options_content_padding_top_bottom: Float;
    private options_content_section_width: Float;
    private options_content_section_row_gap: Float;
    private options_content_section_column_gap: Float;
    private options_content_section_padding_bottom: Float;
    private options_content_section_title_border_width_left_right: Float;
    private options_content_section_title_border_width_top_bottom: Float;
    private options_content_section_types_width: Float;
    private options_content_section_general_toggle_padding: Float;
    private options_content_section_rules_toggle_padding: Float;
    private options_panel_width: Float;
    private options_panel_height: Float;
    private options_panel_padding_left_right: Float;
    private options_panel_padding_top_bottom: Float;

    private help_width: Float;
    private help_height: Float;
    private help_border_width: Float;
    private help_padding: Float;
    private help_row_gap: Float;
    private help_column_gap: Float;
    private help_content_width: Float;
    private help_content_height: Float;
    private help_content_padding_left_right: Float;
    private help_content_padding_top_bottom: Float;
    private help_panel_width: Float;
    private help_panel_height: Float;
    private help_panel_padding_left_right: Float;
    private help_panel_padding_top_bottom: Float;

    constructor(
        {
            parent_width,
            parent_height,
        }: {
            parent_width: Float,
            parent_height: Float,
        },
    )
    {
        this.width = parent_width;
        this.height = parent_height;

        const min_size: Float = this.width < this.height ?
            this.width :
            this.height;

        {
            const square_button_max: Float = 50;
            this.square_button_size = Math.min(Percent(6, min_size), square_button_max);
            this.square_button_border_width = Math.min(Percent(0.5, min_size), square_button_max / 12);
            this.square_button_padding = Math.min(Percent(1, min_size), square_button_max / 6);
            this.square_button_offset = Math.min(Percent(2, min_size), square_button_max / 3);
        }

        this.top_width = this.width;
        this.top_height = this.height;
        this.top_title_area_width = this.top_width;
        this.top_title_area_height = Percent(40, this.top_height);
        this.top_buttons_width = Percent(40, this.top_width);
        this.top_buttons_height = Percent(96, this.top_height - this.top_title_area_height);

        const sub_width: Float = Percent(90, this.width);
        const sub_height: Float = Percent(90, this.height);
        const sub_min_size: Float = sub_width < sub_height ?
            sub_width :
            sub_height;
        const sub_border_width: Float = Percent(0.4, min_size);
        const sub_padding: Float = Percent(2.8, min_size);
        const sub_row_gap: Float = Percent(2.8, sub_height);
        const sub_column_gap: Float = 0;

        const sub_rows_height: Float =
            sub_height -
            (sub_row_gap * 1) -
            (sub_padding * 2) -
            (sub_border_width * 2);
        const sub_columns_width: Float =
            sub_width -
            (sub_column_gap * 0) -
            (sub_padding * 2) -
            (sub_border_width * 2);
        const sub_content_width: Float = sub_columns_width;
        const sub_content_height: Float = Percent(87, sub_rows_height);
        const sub_content_padding_left_right: Float = Percent(1, sub_min_size);
        const sub_content_padding_top_bottom: Float = 0;
        const sub_panel_width: Float = sub_columns_width;
        const sub_panel_height: Float = sub_rows_height - sub_content_height;
        const sub_panel_padding_left_right: Float = sub_content_padding_left_right;
        const sub_panel_padding_top_bottom: Float = sub_content_padding_top_bottom;

        this.options_width = sub_width;
        this.options_height = sub_height;
        this.options_border_width = sub_border_width;
        this.options_padding = sub_padding;
        this.options_row_gap = sub_row_gap;
        this.options_column_gap = sub_column_gap;
        this.options_content_width = sub_content_width;
        this.options_content_height = sub_content_height;
        this.options_content_padding_left_right = sub_content_padding_left_right;
        this.options_content_padding_top_bottom = sub_content_padding_top_bottom;
        this.options_content_section_width =
            this.options_content_width -
            (this.options_content_padding_left_right * 2) -
            Y_Scrollbar_Width();
        this.options_content_section_row_gap = Percent(3.0, this.options_content_height);
        this.options_content_section_column_gap = Percent(3.0, this.options_content_width);
        this.options_content_section_padding_bottom = this.options_content_section_row_gap * 2;
        this.options_content_section_title_border_width_left_right = 0.0;
        this.options_content_section_title_border_width_top_bottom = Percent(0.2, min_size);
        this.options_content_section_types_width = this.options_content_section_width;
        this.options_content_section_general_toggle_padding =
            Percent(0.7, this.options_content_width + this.options_content_height / 2);
        this.options_content_section_rules_toggle_padding =
            this.options_content_section_general_toggle_padding;
        this.options_panel_width = sub_panel_width;
        this.options_panel_height = sub_panel_height;
        this.options_panel_padding_left_right = sub_panel_padding_left_right;
        this.options_panel_padding_top_bottom = sub_panel_padding_top_bottom;

        this.help_width = sub_width;
        this.help_height = sub_height;
        this.help_border_width = sub_border_width;
        this.help_padding = sub_padding;
        this.help_row_gap = sub_row_gap;
        this.help_column_gap = sub_column_gap;
        this.help_content_width = sub_content_width;
        this.help_content_height = sub_content_height;
        this.help_content_padding_left_right = sub_content_padding_left_right;
        this.help_content_padding_top_bottom = sub_content_padding_top_bottom;
        this.help_panel_width = sub_panel_width;
        this.help_panel_height = sub_panel_height;
        this.help_panel_padding_left_right = sub_panel_padding_left_right;
        this.help_panel_padding_top_bottom = sub_panel_padding_top_bottom;

        Object.freeze(this);
    }

    Menu_Width():
        Float
    {
        return this.width;
    }

    Menu_Height():
        Float
    {
        return this.height;
    }

    Square_Button_Width():
        Float
    {
        return this.square_button_size;
    }

    Square_Button_Height():
        Float
    {
        return this.square_button_size;
    }

    Square_Button_Border_Width():
        Float
    {
        return this.square_button_border_width;
    }

    Square_Button_Padding():
        Float
    {
        return this.square_button_padding;
    }

    Square_Button_Left():
        Float
    {
        return this.square_button_offset;
    }

    Square_Button_Bottom():
        Float
    {
        return this.square_button_offset;
    }

    Content_Width():
        Float
    {
        return this.width;
    }

    Content_Height():
        Float
    {
        return this.height;
    }

    Top_Width():
        Float
    {
        return this.top_width;
    }

    Top_Height():
        Float
    {
        return this.top_height;
    }

    Top_Title_Area_Width():
        Float
    {
        return this.top_title_area_width;
    }

    Top_Title_Area_Height():
        Float
    {
        return this.top_title_area_height;
    }

    Top_Buttons_Width():
        Float
    {
        return this.top_buttons_width;
    }

    Top_Buttons_Height():
        Float
    {
        return this.top_buttons_height;
    }

    Options_Width():
        Float
    {
        return this.options_width;
    }

    Options_Height():
        Float
    {
        return this.options_height;
    }

    Options_Border_Width():
        Float
    {
        return this.options_border_width;
    }

    Options_Padding():
        Float
    {
        return this.options_padding;
    }

    Options_Row_Gap():
        Float
    {
        return this.options_row_gap;
    }

    Options_Column_Gap():
        Float
    {
        return this.options_column_gap;
    }

    Options_Content_Width():
        Float
    {
        return this.options_content_width;
    }

    Options_Content_Height():
        Float
    {
        return this.options_content_height;
    }

    Options_Content_Padding_Left_Right():
        Float
    {
        return this.options_content_padding_left_right;
    }

    Options_Content_Padding_Top_Bottom():
        Float
    {
        return this.options_content_padding_top_bottom;
    }

    Options_Content_Section_Width():
        Float
    {
        return this.options_content_section_width;
    }

    Options_Content_Section_Padding_Bottom():
        Float
    {
        return this.options_content_section_padding_bottom;
    }

    Options_Content_Section_Row_Gap():
        Float
    {
        return this.options_content_section_row_gap;
    }

    Options_Content_Section_Column_Gap():
        Float
    {
        return this.options_content_section_column_gap;
    }

    Options_Content_Section_Title_Border_Width_Left_Right():
        Float
    {
        return this.options_content_section_title_border_width_left_right;
    }

    Options_Content_Section_Title_Border_Width_Top_Bottom():
        Float
    {
        return this.options_content_section_title_border_width_top_bottom;
    }

    Options_Content_Section_Types_Width():
        Float
    {
        return this.options_content_section_types_width;
    }

    Options_Content_Section_General_Toggle_Padding():
        Float
    {
        return this.options_content_section_general_toggle_padding;
    }

    Options_Content_Section_Rules_Toggle_Padding():
        Float
    {
        return this.options_content_section_rules_toggle_padding;
    }

    Options_Panel_Width():
        Float
    {
        return this.options_panel_width;
    }

    Options_Panel_Height():
        Float
    {
        return this.options_panel_height;
    }

    Options_Panel_Padding_Left_Right():
        Float
    {
        return this.options_panel_padding_left_right;
    }

    Options_Panel_Padding_Top_Bottom():
        Float
    {
        return this.options_panel_padding_top_bottom;
    }

    Help_Width():
        Float
    {
        return this.help_width;
    }

    Help_Height():
        Float
    {
        return this.help_height;
    }

    Help_Border_Width():
        Float
    {
        return this.help_border_width;
    }

    Help_Padding():
        Float
    {
        return this.help_padding;
    }

    Help_Row_Gap():
        Float
    {
        return this.help_row_gap;
    }

    Help_Column_Gap():
        Float
    {
        return this.help_column_gap;
    }

    Help_Content_Width():
        Float
    {
        return this.help_content_width;
    }

    Help_Content_Height():
        Float
    {
        return this.help_content_height;
    }

    Help_Content_Padding_Left_Right():
        Float
    {
        return this.help_content_padding_left_right;
    }

    Help_Content_Padding_Top_Bottom():
        Float
    {
        return this.help_content_padding_top_bottom;
    }

    Help_Panel_Width():
        Float
    {
        return this.help_panel_width;
    }

    Help_Panel_Height():
        Float
    {
        return this.help_panel_height;
    }

    Help_Panel_Padding_Left_Right():
        Float
    {
        return this.help_panel_padding_left_right;
    }

    Help_Panel_Padding_Top_Bottom():
        Float
    {
        return this.help_panel_padding_top_bottom;
    }
}

type Menu_Props = {
    model: Model.Menu.Instance;
    parent: Main;
    event_grid: Event.Grid;
}

export class Menu extends Component<Menu_Props>
{
    private content: Content | null = null;
    private show_button: Show_Button | null = null;

    private measurements: Menu_Measurements = new Menu_Measurements({
        parent_width: this.Parent().Width(),
        parent_height: this.Parent().Height(),
    });

    // put these in model.
    private is_hidden: boolean = false;
    private is_disabled: boolean = false;

    Main():
        Main
    {
        return this.Parent();
    }

    Content():
        Content
    {
        return this.Try_Object(this.content);
    }

    Measurements():
        Menu_Measurements
    {
        return this.measurements;
    }

    Width():
        Float
    {
        return this.Measurements().Menu_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Menu_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Menu.Instance = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();

        if (this.is_hidden) {
            return (
                <div
                    className={`Menu`}
                    onClick={event => this.On_Click(event)}
                >
                    <Show_Button
                        ref={ref => this.show_button = ref}

                        model={model}
                        parent={this}
                        event_grid={event_grid}
                    />
                </div>
            );
        } else {
            return (
                <div
                    className={`Menu`}
                >
                    <Content
                        ref={ref => this.content = ref}

                        model={model}
                        parent={this}
                        event_grid={event_grid}
                    />
                </div>
            );
        }
    }

    override On_Restyle():
        Component_Styles
    {
        let cursor: string;
        if (this.is_hidden) {
            cursor = `pointer`;
        } else {
            cursor = `default`;
        }

        return ({
            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            cursor: cursor,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return [
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_TOP_MENU),
                event_handler: this.On_Open_Top_Menu,
            },
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_OPTIONS_MENU),
                event_handler: this.On_Open_Options_Menu,
            },
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_HELP_MENU),
                event_handler: this.On_Open_Help_Menu,
            },
            {
                event_name: new Event.Name(Event.ON, Event.DISABLE_MENUS),
                event_handler: this.On_Disable_Menus,
            },
            {
                event_name: new Event.Name(Event.ON, Event.SHOW_MENUS),
                event_handler: this.On_Show_Menus,
            },
            {
                event_name: new Event.Name(Event.ON, Event.HIDE_MENUS),
                event_handler: this.On_Hide_Menus,
            },
        ];
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.preventDefault();
        event.stopPropagation();

        if (this.Is_Alive()) {
            if (event.target === this.Some_Element()) {
                await this.Send({
                    name_affix: Event.SHOW_MENUS,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Show_Menus_Data,
                    is_atomic: true,
                });
            }
        }
    }

    override On_Resize(
        data: Event.Resize_Data,
    ):
        void
    {
        this.measurements = new Menu_Measurements({
            parent_width: this.Parent().Width(),
            parent_height: this.Parent().Height(),
        });

        super.On_Resize(data);
    }

    async On_Open_Top_Menu():
        Promise<void>
    {
        if (this.Is_Alive() && !this.is_disabled) {
            this.Model().Open_Top();

            await this.Refresh();
        }
    }

    async On_Open_Options_Menu():
        Promise<void>
    {
        if (this.Is_Alive() && !this.is_disabled) {
            this.Model().Open_Options();

            await this.Refresh();
        }
    }

    async On_Open_Help_Menu():
        Promise<void>
    {
        if (this.Is_Alive() && !this.is_disabled) {
            this.Model().Open_Help();

            await this.Refresh();
        }
    }

    async On_Disable_Menus():
        Promise<void>
    {
        this.is_disabled = true;
    }

    async On_Show_Menus(
        {
        }: Event.Show_Menus_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.is_hidden = false;
            await this.Refresh();
        }
    }

    async On_Hide_Menus(
        {
        }: Event.Hide_Menus_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive() && !this.is_disabled) {
            this.is_hidden = true;
            await this.Refresh();
        }
    }
}

type Content_Props = {
    model: Model.Menu.Instance;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Content extends Component<Content_Props>
{
    private top: Top | null = null;
    private options: Options.Instance | null = null;
    private help: Help.Instance | null = null;

    Main():
        Main
    {
        return this.Menu().Main();
    }

    Menu():
        Menu
    {
        return this.Parent();
    }

    Top():
        Top
    {
        return this.Try_Object(this.top);
    }

    Options():
        Options.Instance
    {
        return this.Try_Object(this.options);
    }

    Help():
        Help.Instance
    {
        return this.Try_Object(this.help);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Content_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Content_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Menu.Instance = this.Model();
        const current_menu: Model.Enum.Menu = model.Current_Menu();

        if (current_menu === Model.Enum.Menu.TOP) {
            return (
                <div
                    className={`Content`}
                >
                    <Top
                        ref={ref => this.top = ref}

                        model={this.Model().Top()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else if (current_menu === Model.Enum.Menu.OPTIONS) {
            return (
                <div
                    className={`Content`}
                    onClick={event => this.On_Click(event)}
                >
                    <Options.Instance
                        ref={ref => this.options = ref}

                        model={this.Model().Options()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else if (current_menu === Model.Enum.Menu.HELP) {
            return (
                <div
                    className={`Content`}
                    onClick={event => this.On_Click(event)}
                >
                    <Help.Instance
                        ref={ref => this.help = ref}

                        model={this.Model().Help()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            backgroundColor: `rgba(0, 0, 0, 0.4)`,

            cursor: `pointer`,
        });
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.preventDefault();
        event.stopPropagation();

        if (this.Is_Alive()) {
            if (event.target === this.Some_Element()) {
                await this.Send({
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
}

type Show_Button_Props = {
    model: Model.Menu.Instance;
    parent: Menu;
    event_grid: Event.Grid;
}

class Show_Button extends Button<Show_Button_Props>
{
    Menu():
        Menu
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
        return `Show_Button`;
    }

    override Text():
        string
    {
        return `X`;
    }

    override CSS_Width():
        string
    {
        return `${this.Measurements().Square_Button_Width()}px`;
    }

    override CSS_Height():
        string
    {
        return `${this.Measurements().Square_Button_Height()}px`;
    }

    override CSS_Padding_Left():
        string
    {
        return `${this.Measurements().Square_Button_Padding()}px`;
    }

    override CSS_Padding_Top():
        string
    {
        return `${this.Measurements().Square_Button_Padding()}px`;
    }

    override CSS_Padding_Right():
        string
    {
        return `${this.Measurements().Square_Button_Padding()}px`;
    }

    override CSS_Padding_Bottom():
        string
    {
        return `${this.Measurements().Square_Button_Padding()}px`;
    }

    override CSS_Text_Color():
        string
    {
        return `white`;
    }

    override CSS_Text_Size():
        string
    {
        return `1em`;
    }

    override CSS_Background_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    override CSS_Activated_Text_Color():
        string
    {
        return `black`;
    }

    override CSS_Activated_Text_Size():
        string
    {
        return `1em`;
    }

    override CSS_Activated_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    override On_Restyle():
        Component_Styles
    {
        const styles: Component_Styles = super.On_Restyle();
        styles.borderWidth = `${this.Measurements().Square_Button_Border_Width()}px`;
        styles.position = `fixed`;
        styles.left = `${this.Measurements().Square_Button_Left()}px`;
        styles.bottom = `${this.Measurements().Square_Button_Bottom()}px`;
        styles.zIndex = `1`;

        return styles;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Send({
                name_affix: Event.SHOW_MENUS,
                name_suffixes: [
                ],
                data: {
                } as Event.Show_Menus_Data,
                is_atomic: true,
            });
        }
    }
}
