import ReactDOM_Client from "react-dom/client";

import * as Event from "./event";
import * as Model from "./model";
import * as View from "./view";

const root_element: HTMLElement | null = document.getElementById("root");
if (root_element == null) {
    throw new Error(`'root_element' could not be found in the dom.`);
} else {
    const root_component: ReactDOM_Client.Root = ReactDOM_Client.createRoot(root_element);

    root_component.render(
        <View.Main
            model={new Model.Main({})}
            parent={root_element}
            event_grid={new Event.Grid()}
        />
    );
}
