import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Arena } from "../arena";
import { Board } from "../board";

type Bumper_Props = {
    model: Model.Board.Instance;
    parent: Board;
    event_grid: Event.Grid;
}

export class Bumper extends Component<Bumper_Props>
{
    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Bumper`}
            >
            </div >
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,
        });
    }
}
