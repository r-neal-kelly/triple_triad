import * as Event from "../event";
import { Component, Component_Styles } from "../component";

type Button_Props = {
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

export class Button extends Component<Button_Props>
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
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

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

    async On_Activate(event: React.SyntheticEvent):
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
                onClick={event => this.Parent().On_Activate(event)}
            >
            </div>
        );
    }
}
