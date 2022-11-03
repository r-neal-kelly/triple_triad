import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Bumper } from "./bumper";

type Name_Props = {
    model: Model.Player.Instance;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Name extends Component<Name_Props>
{
    Player_Bumper():
        Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.Model().Index();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Name`}
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            color: `white`,
            textAlign: `center`,
        });
    }
}
