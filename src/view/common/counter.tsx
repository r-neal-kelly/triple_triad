import { Integer } from "../../types";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Props } from "../component";
import { Component_Styles } from "../component";

interface Counter_Props extends Component_Props
{
}

export class Counter<Props extends Counter_Props> extends Component<Props>
{
    private value: Value | null = null;
    private decrementor: Decrementor | null = null;
    private incrementor: Incrementor | null = null;

    Value():
        Value
    {
        if (this.value == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.value;
        }
    }

    Decrementor():
        Decrementor
    {
        if (this.decrementor == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.decrementor;
        }
    }

    Incrementor():
        Incrementor
    {
        if (this.incrementor == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.incrementor;
        }
    }

    Name():
        string
    {
        return `Counter`;
    }

    Text():
        string
    {
        return `Counter`;
    }

    Count():
        Integer
    {
        return 0;
    }

    Can_Decrement():
        boolean
    {
        return false;
    }

    Can_Increment():
        boolean
    {
        return true;
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

    CSS_Button_Width():
        string
    {
        return `75%`;
    }

    CSS_Button_Height():
        string
    {
        return `75%`;
    }

    CSS_Text_Size():
        string
    {
        return `1em`;
    }

    CSS_Enabled_Background_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    CSS_Enabled_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Disabled_Background_Color():
        string
    {
        return `rgba(63, 15, 15, 0.7)`;
    }

    CSS_Disabled_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Triggered_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    CSS_Triggered_Text_Color():
        string
    {
        return `black`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `2.5fr 1fr 1fr`,
            gridTemplateRows: `1fr`,
            columnGap: `0`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            margin: `0`,
            padding: `0`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: this.CSS_Enabled_Background_Color(),
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: this.CSS_Enabled_Text_Color(),
            fontSize: this.CSS_Text_Size(),
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
                <Value
                    ref={ref => this.value = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Decrementor
                    ref={ref => this.decrementor = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Incrementor
                    ref={ref => this.incrementor = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
    }

    async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Value_Props = {
    model: any;
    parent: Counter<Counter_Props>;
    event_grid: Event.Grid;
}

class Value extends Component<Value_Props>
{
    Counter():
        Counter<Counter_Props>
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `fit-content`,
            height: `fit-content`,

            alignSelf: `center`,
            justifySelf: `center`,

            backgroundColor: `transparent`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: `inherit`,
            fontSize: `inherit`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const counter: Counter<Counter_Props> = this.Counter();

        return (
            <div
                style={this.Styles()}
            >
                {`${counter.Text()}: ${counter.Count()}`}
            </div>
        );
    }
}

type Decrementor_Props = {
    model: any;
    parent: Counter<Counter_Props>;
    event_grid: Event.Grid;
}

class Decrementor extends Component<Decrementor_Props>
{
    private cover: Decrementor_Cover | null = null;

    Counter():
        Counter<Counter_Props>
    {
        return this.Parent();
    }

    Cover():
        Decrementor_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
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

            width: this.Counter().CSS_Button_Width(),
            height: this.Counter().CSS_Button_Height(),

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `100%`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: 'transparent',
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: `inherit`,
            fontSize: `inherit`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const counter: Counter<Counter_Props> = this.Parent();

        if (counter.Can_Decrement()) {
            this.Change_Style(`backgroundColor`, counter.CSS_Enabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Enabled_Text_Color());
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, counter.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Disabled_Text_Color());
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
            >
                <div
                    style={{
                        color: `inherit`,
                        fontSize: `inherit`,
                    }}
                >
                    {`-`}
                </div>
                <Decrementor_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Decrementor_Cover_Props = {
    model: any;
    parent: Decrementor;
    event_grid: Event.Grid;
}

class Decrementor_Cover extends Component<Decrementor_Cover_Props>
{
    Counter():
        Counter<Counter_Props>
    {
        return this.Decrementor().Counter();
    }

    Decrementor():
        Decrementor
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
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const counter: Counter<Counter_Props> = this.Counter();

        if (counter.Can_Decrement()) {
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
                onClick={event => counter.On_Decrement(event)}
            >
            </div>
        );
    }
}

type Incrementor_Props = {
    model: any;
    parent: Counter<Counter_Props>;
    event_grid: Event.Grid;
}

class Incrementor extends Component<Incrementor_Props>
{
    private cover: Incrementor_Cover | null = null;

    Counter():
        Counter<Counter_Props>
    {
        return this.Parent();
    }

    Cover():
        Incrementor_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
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

            width: this.Counter().CSS_Button_Width(),
            height: this.Counter().CSS_Button_Height(),

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `100%`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: 'transparent',
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: `inherit`,
            fontSize: `inherit`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const counter: Counter<Counter_Props> = this.Parent();

        if (counter.Can_Increment()) {
            this.Change_Style(`backgroundColor`, counter.CSS_Enabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Enabled_Text_Color());
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, counter.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Disabled_Text_Color());
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
            >
                <div
                    style={{
                        color: `inherit`,
                        fontSize: `inherit`,
                    }}
                >
                    {`+`}
                </div>
                <Incrementor_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Incrementor_Cover_Props = {
    model: any;
    parent: Incrementor;
    event_grid: Event.Grid;
}

class Incrementor_Cover extends Component<Incrementor_Cover_Props>
{
    Counter():
        Counter<Counter_Props>
    {
        return this.Incrementor().Counter();
    }

    Incrementor():
        Incrementor
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
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const counter: Counter<Counter_Props> = this.Counter();

        if (counter.Can_Increment()) {
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
                onClick={event => counter.On_Increment(event)}
            >
            </div>
        );
    }
}
