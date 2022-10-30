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

    CSS_Activated_Enabled_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    CSS_Activated_Enabled_Text_Color():
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

    Refresh_Animations():
        void
    {
        const counter: Counter<Counter_Props> = this.Parent();

        this.Change_Animation({
            animation_name: `Activate_Enabled`,
            animation_body: `
                0% {
                    background-color: ${counter.CSS_Enabled_Background_Color()};
                    color: ${counter.CSS_Enabled_Text_Color()};
                }
            
                50% {
                    background-color: ${counter.CSS_Activated_Enabled_Background_Color()};
                    color: ${counter.CSS_Activated_Enabled_Text_Color()};
                }

                100% {
                    background-color: ${counter.CSS_Enabled_Background_Color()};
                    color: ${counter.CSS_Enabled_Text_Color()};
                }
            `,
        });
    }

    Refresh_Styles():
        void
    {
        const counter: Counter<Counter_Props> = this.Parent();

        this.Change_Style(`width`, this.Counter().CSS_Button_Width());
        this.Change_Style(`height`, this.Counter().CSS_Button_Height());

        if (counter.Can_Decrement()) {
            this.Change_Style(`backgroundColor`, counter.CSS_Enabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Enabled_Text_Color());
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, counter.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Disabled_Text_Color());
            this.Change_Style(`cursor`, `default`);
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
        this.Refresh_Animations();
        this.Refresh_Styles();

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
                onClick={event => this.On_Decrement(event)}
            >
            </div>
        );
    }

    async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        const counter: Counter<Counter_Props> = this.Counter();
        if (counter.Is_Alive() && counter.Can_Decrement()) {
            const decrementor: Decrementor = this.Decrementor();
            if (decrementor.Is_Alive()) {
                decrementor.Refresh_Animations();
                await decrementor.Animate({
                    animation_name: `Activate_Enabled`,
                    duration_in_milliseconds: 200,
                    css_iteration_count: `1`,
                    css_timing_function: `ease`,
                    css_direction: `normal`,
                    css_fill_mode: `both`,
                });
                if (counter.Is_Alive() && decrementor.Is_Alive()) {
                    decrementor.Deanimate();
                    counter.On_Decrement(event);
                }
            }
        }
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

    Refresh_Animations():
        void
    {
        const counter: Counter<Counter_Props> = this.Parent();

        this.Change_Animation({
            animation_name: `Activate_Enabled`,
            animation_body: `
                0% {
                    background-color: ${counter.CSS_Enabled_Background_Color()};
                    color: ${counter.CSS_Enabled_Text_Color()};
                }
            
                50% {
                    background-color: ${counter.CSS_Activated_Enabled_Background_Color()};
                    color: ${counter.CSS_Activated_Enabled_Text_Color()};
                }

                100% {
                    background-color: ${counter.CSS_Enabled_Background_Color()};
                    color: ${counter.CSS_Enabled_Text_Color()};
                }
            `,
        });
    }

    Refresh_Styles():
        void
    {
        const counter: Counter<Counter_Props> = this.Parent();

        this.Change_Style(`width`, this.Counter().CSS_Button_Width());
        this.Change_Style(`height`, this.Counter().CSS_Button_Height());

        if (counter.Can_Increment()) {
            this.Change_Style(`backgroundColor`, counter.CSS_Enabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Enabled_Text_Color());
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, counter.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, counter.CSS_Disabled_Text_Color());
            this.Change_Style(`cursor`, `default`);
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
        this.Refresh_Animations();
        this.Refresh_Styles();

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
                onClick={event => this.On_Increment(event)}
            >
            </div>
        );
    }

    async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        const counter: Counter<Counter_Props> = this.Counter();
        if (counter.Is_Alive() && counter.Can_Increment()) {
            const incrementor: Incrementor = this.Incrementor();
            if (incrementor.Is_Alive()) {
                incrementor.Refresh_Animations();
                await incrementor.Animate({
                    animation_name: `Activate_Enabled`,
                    duration_in_milliseconds: 200,
                    css_iteration_count: `1`,
                    css_timing_function: `ease`,
                    css_direction: `normal`,
                    css_fill_mode: `both`,
                });
                if (counter.Is_Alive() && incrementor.Is_Alive()) {
                    incrementor.Deanimate();
                    counter.On_Increment(event);
                }
            }
        }
    }
}
