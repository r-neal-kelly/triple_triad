import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Button } from "../common/button";
import { Menu } from "../menu";

type Help_Props = {
    model: Model.Menu_Help;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Help extends Component<Help_Props>
{
    private back_button: Back_Button | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Back_Button():
        Back_Button
    {
        return this.Try_Object(this.back_button);
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `9fr 1.5fr`,
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

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Options`}
                style={this.Styles()}
            >
                <div></div>
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

type Back_Button_Props = {
    model: Model.Menu_Help;
    parent: Help;
    event_grid: Event.Grid;
}

class Back_Button extends Button<Back_Button_Props>
{
    Help():
        Help
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
