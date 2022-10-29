import { Float } from "../types";

import { Assert } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component, Component_Styles } from "./component";
import { Main } from "./main";
import { Top } from "./menu/top";
import { Options } from "./menu/options";

type Menu_Props = {
    model: Model.Menu;
    parent: Main;
    event_grid: Event.Grid;
}

export class Menu extends Component<Menu_Props>
{
    private top: Top | null = null;
    private options: Options | null = null;

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

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.4)`,
        });
    }

    On_Refresh():
        JSX.Element
    {
        const model: Model.Menu = this.Model();
        const current_menu: Model.Menu_e = model.Current_Menu();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (current_menu === Model.Menu_e.TOP) {
            return (
                <div
                    className={`Menu`}
                    style={this.Styles()}
                >
                    <Top
                        ref={ref => this.top = ref}

                        model={this.Model().Top()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else if (current_menu === Model.Menu_e.OPTIONS) {
            return (
                <div
                    style={this.Styles()}
                >
                    <Options
                        ref={ref => this.options = ref}

                        model={this.Model().Options()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            Assert(false);

            return <div></div>;
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        return [
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_TOP_MENU),
                event_handler: this.On_Open_Top_Menu,
            },
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_OPTIONS_MENU),
                event_handler: this.On_Open_Options_Menu,
            },
        ];
    }

    On_Resize(
        {
            width,
            height,
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Change_Style(`width`, this.CSS_Width());
            this.Change_Style(`height`, this.CSS_Height());

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width,
                    height,
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
    }

    async On_Open_Top_Menu():
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Open_Top();

            await this.Refresh();
        }
    }

    async On_Open_Options_Menu():
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Open_Options();

            await this.Refresh();
        }
    }
}
