import { Float } from "../types";

import * as Model from "../model";

import * as Event from "./event";
import { Component, Component_Styles } from "./component";
import { Main } from "./main";
import { Top } from "./menu/top";
import { Options } from "./menu/options";
import { Help } from "./menu/help";

type Menu_Props = {
    model: Model.Menu.Instance;
    parent: Main;
    event_grid: Event.Grid;
}

export class Menu extends Component<Menu_Props>
{
    private top: Top | null = null;
    private options: Options | null = null;
    private help: Help | null = null;

    private is_disabled: boolean = false;

    Main():
        Main
    {
        return this.Parent();
    }

    Top():
        Top
    {
        return this.Try_Object(this.top);
    }

    Options():
        Options
    {
        return this.Try_Object(this.options);
    }

    Help():
        Help
    {
        return this.Try_Object(this.help);
    }

    Width():
        Float
    {
        return this.Parent().Width();
    }

    Height():
        Float
    {
        return this.Parent().Height();
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Menu.Instance = this.Model();
        const current_menu: Model.Enum.Menu = model.Current_Menu();

        if (current_menu === Model.Enum.Menu.TOP) {
            return (
                <div
                    className={`Menu`}
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
                    className={`Menu`}
                >
                    <Options
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
                    className={`Menu`}
                >
                    <Help
                        ref={ref => this.help = ref}

                        model={this.Model().Help()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return (
                <div
                    className={`Menu`}
                >
                </div>
            );
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

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.4)`,
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
        ];
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
}
