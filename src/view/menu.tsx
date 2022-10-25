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
        if (this.top == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.top;
        }
    }

    Options():
        Options
    {
        if (this.options == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.options;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
        });
    }

    On_Refresh():
        JSX.Element
    {
        const model: Model.Menu = this.Model();
        const current_menu: Model.Menu_e = model.Current_Menu();

        if (current_menu === Model.Menu_e.TOP) {
            return (
                <div
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
                event_name: new Event.Name(Event.ON, Event.OPEN_TOP_MENU),
                event_handler: this.On_Open_Top_Menu,
            },
            {
                event_name: new Event.Name(Event.ON, Event.OPEN_OPTIONS_MENU),
                event_handler: this.On_Open_Options_Menu,
            },
        ];
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
