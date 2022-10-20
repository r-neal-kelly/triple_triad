import React from "react";
import ReactDOM from "react-dom/client";

import Main from "./view";

const root_element: HTMLElement | null = document.getElementById("root");
if (root_element == null) {
    throw new Error(`'root_element' could not be found in the dom.`);
} else {
    const root_component: ReactDOM.Root = ReactDOM.createRoot(root_element);

    root_component.render(
        <Main />
    );
}
