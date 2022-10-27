import * as Model from "../../model";

import { Component } from "../component";
import { Component_Props } from "../component";
import { Component_Styles } from "../component";

interface Color_Props extends Component_Props
{
}

export class Color<Props extends Color_Props> extends Component<Props>
{
    Name():
        string
    {
        return `Color`;
    }

    Color():
        Model.Color
    {
        return new Model.Color({});
    }

    CSS_Width():
        string
    {
        return `100%`;
    }

    CSS_Height():
        string
    {
        return `100%`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            margin: `0`,
            padding: `0`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const color: Model.Color = this.Color();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());
        this.Change_Style(
            `backgroundColor`,
            `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,
        );

        return (
            <div
                className={this.Name()}
                style={this.Styles()}
                onClick={event => this.On_Activate(event)}
            >
            </div>
        );
    }

    async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}
