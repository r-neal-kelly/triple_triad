import { Float } from "../types";

import { Wait } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";

import { Exhibitions } from "./exhibitions";
import { Game } from "./game";

type Exhibition_Props = {
    model: Model.Exhibition.Instance;
    parent: Exhibitions;
    event_grid: Event.Grid;
}

export class Exhibition extends Component<Exhibition_Props>
{
    private game: Game | null = null;

    Exhibitions():
        Exhibitions
    {
        return this.Parent();
    }

    Game():
        Game
    {
        return this.Try_Object(this.game);
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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Exhibition.Instance = this.Model();
        const arena: Model.Arena.Instance = model.Arena();

        return (
            <div
                className={`Exhibition`}
            >
                <Game
                    key={`game_${arena.ID()}`}
                    ref={ref => this.game = ref}

                    model={arena}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        let display: string;
        if (this.Model().Is_Visible()) {
            display = ``;
        } else {
            display = `none`;
        }

        return ({
            display: display,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,
            opacity: `100%`,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return ([
            {
                event_name: new Event.Name(Event.AFTER, Event.GAME_STOP),
                event_handler: this.After_Game_Stop,
            },
        ]);
    }

    async After_Game_Stop():
        Promise<void>
    {
        if (this.Is_Alive()) {
            while (
                // this makes me think we may want an Is_Animating() on component
                this.Exhibitions().Is_Switching() ||
                this.Model().Is_Visible()
            ) {
                await Wait(100);
                if (this.Is_Dead()) {
                    break;
                }
            }
            if (this.Is_Alive()) {
                this.Model().Regenerate();
                await this.Refresh();
            }
        }
    }
}
