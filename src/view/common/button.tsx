import * as Event from "../event";
import { Component } from "../component";
import { Component_Props } from "../component";
import { Component_Styles } from "../component";

interface Button_Props extends Component_Props
{
}

export class Button<Props extends Button_Props> extends Component<Props>
{
    private cover: Button_Cover | null = null;

    Cover():
        Button_Cover
    {
        return this.Try_Object(this.cover);
    }

    Name():
        string
    {
        return `Button`;
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

    CSS_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Text_Size():
        string
    {
        return `1em`;
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

            color: this.CSS_Text_Color(),
            fontSize: this.CSS_Text_Size(),

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={this.Name()}
                style={this.Styles()}
            >
                <div
                    className={`Button_Text`}
                    style={{
                        color: `inherit`,
                    }}
                >
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
    parent: Button<Button_Props>;
    event_grid: Event.Grid;
}

class Button_Cover extends Component<Button_Cover_Props>
{
    Button():
        Button<Button_Props>
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
                className={`Button_Cover`}
                style={this.Styles()}
                onClick={event => this.Parent().On_Activate(event)}
            >
            </div>
        );
    }
}
