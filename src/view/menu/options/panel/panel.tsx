import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Button } from "../../../common/button";

import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";

type Panel_Props = {
    model: Model.Options;
    parent: Options;
    event_grid: Event.Grid;
}

export class Panel extends Component<Panel_Props>
{
    private back_button: Back_Button | null = null;

    Options():
        Options
    {
        return this.Parent();
    }

    Back_Button():
        Back_Button
    {
        return this.Try_Object(this.back_button);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Options_Panel_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Options_Panel_Height();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Options_Panel_Padding_Left_Right();
    }

    Padding_Top_Bottom():
        Float
    {
        return this.Measurements().Options_Panel_Padding_Top_Bottom();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Panel`}
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
            padding: `
                ${this.Padding_Top_Bottom()}px
                ${this.Padding_Left_Right()}px
            `,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }
}

type Back_Button_Props = {
    model: Model.Options;
    parent: Panel;
    event_grid: Event.Grid;
}

class Back_Button extends Button<Back_Button_Props>
{
    Options():
        Options
    {
        return this.Panel().Options();
    }

    Panel():
        Panel
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
