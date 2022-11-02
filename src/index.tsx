import "./index.css";

import ReactDOM_Client from "react-dom/client";

import * as Event from "./event";
import * as Model from "./model";
import { Main } from "./view/main";

const root_element: HTMLElement | null = document.getElementById("root");
if (root_element == null) {
    throw new Error(`'root_element' could not be found in the dom.`);
} else {
    ReactDOM_Client.createRoot(root_element).render(
        <Main
            root={root_element}
            model={new Model.Main({})}
            parent={null}
            event_grid={new Event.Grid()}
        />
    );
}
