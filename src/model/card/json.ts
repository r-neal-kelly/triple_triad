import { Name } from "./name";
import { Rank } from "./rank";
import { Element } from "./element";
import { Image } from "./image";

export type JSON = {
    name: Name;
    image: Image;
    element: Element;
    left: Rank;
    top: Rank;
    right: Rank;
    bottom: Rank;
}
