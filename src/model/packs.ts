import { Random_Integer_Exclusive } from "../utils";

import * as Pack from "./pack";

import cats_pack_json from "../packs/cats.json";

export class Packs
{
    private pack_count: Pack.Count;
    private packs: { [index: Pack.Name]: Pack.Instance };

    constructor()
    {
        const packs_json: Array<Pack.JSON> = [
            cats_pack_json,
        ];

        this.pack_count = packs_json.length;
        this.packs = {};

        packs_json.forEach(function (
            this: Packs,
            pack_json: Pack.JSON,
        ):
            void
        {
            if (this.packs[pack_json.name] != null) {
                throw new Error(`Pack with the name "${pack_json.name}" already exists.`);
            } else {
                Object.freeze(pack_json);
                Object.freeze(pack_json.tiers);

                this.packs[pack_json.name] = new Pack.Instance({
                    packs: this,
                    pack_json,
                });
            }
        }, this);

        Object.freeze(this);
        Object.freeze(this.packs);
    }

    Pack_Count():
        Pack.Count
    {
        return this.pack_count;
    }

    Pack(pack_name: Pack.Name):
        Pack.Instance
    {
        const pack = this.packs[pack_name];

        if (pack == null) {
            throw new Error(`Invalid pack_name.`);
        } else {
            return pack;
        }
    }

    Random_Pack():
        Pack.Instance
    {
        return this.As_Array()[Random_Integer_Exclusive(0, this.Pack_Count())];
    }

    As_Array():
        Array<Pack.Instance>
    {
        return Object.values(this.packs); // probably want to sort by pack_name
    }
}
