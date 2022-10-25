import * as Model from "../../model";

import * as Event from "../event";
import { Component, Component_Styles } from "../component";
import { Menu } from "../menu";

type Options_Props = {
    model: Model.Menu_Options;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Options extends Component<Options_Props>
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
            gridTemplateRows: `1fr 1fr 1fr`,
            columnGap: `3%`,
            rowGap: `5%`,

            width: `90%`,
            height: `90%`,
            margin: `0`,
            padding: `3%`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.3)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
            >
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

type Button_Props = {
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

class Button extends Component<Button_Props>
{
    private cover: Button_Cover | null = null;

    Cover():
        Button_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Text():
        string
    {
        return ``;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `40%`,
            height: `100%`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            fontSize: `2.5em`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
            >
                <div>
                    {this.Text()}
                </div>
                <Button_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Button_Cover_Props = {
    model: any;
    parent: Button;
    event_grid: Event.Grid;
}

class Button_Cover extends Component<Button_Cover_Props>
{
    Button():
        Button
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `transparent`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
                onClick={this.Parent().On_Click.bind(this)}
            >
            </div>
        );
    }
}

class Back_Button extends Button
{
    Text():
        string
    {
        return `Back`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
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
