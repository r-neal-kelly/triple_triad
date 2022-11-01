import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Bumper } from "./bumper";

type Name_Props = {
    model: Model.Player;
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
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            color: `white`,
            textAlign: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Name`}
                style={this.Styles()}
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }
}
