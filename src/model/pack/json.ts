import { Name } from "./name";
import * as Tier from "../tier";

export type JSON = {
    name: Name;
    tiers: Array<Tier.JSON>;
}
