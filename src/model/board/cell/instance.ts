import * as Color from "../../color";
import * as Player from "../../player";
import * as Stake from "../../stake";

/* Represents an empty cell or a player that's making a claim on a stake. */
export class Instance
{
    private stake: Stake.Instance | null;
    private claimant: Player.Instance | null;

    constructor(
        occupant?: {
            stake: Stake.Instance,
            claimant: Player.Instance,
        },
    )
    {
        if (occupant != null) {
            this.stake = occupant.stake;
            this.claimant = occupant.claimant;
        } else {
            this.stake = null;
            this.claimant = null;
        }

        Object.freeze(this);
    }

    Clone():
        Instance
    {
        if (this.Is_Occupied()) {
            return new Instance(
                {
                    stake: this.stake as Stake.Instance,
                    claimant: this.claimant as Player.Instance,
                },
            );
        } else {
            return new Instance();
        }
    }

    Is_Empty():
        boolean
    {
        return this.stake == null;
    }

    Is_Occupied():
        boolean
    {
        return !this.Is_Empty();
    }

    Stake():
        Stake.Instance
    {
        if (this.stake == null) {
            throw new Error(`This cell is not occupied.`);
        } else {
            return this.stake;
        }
    }

    Claimant():
        Player.Instance
    {
        if (this.claimant == null) {
            throw new Error(`This cell is not occupied.`);
        } else {
            return this.claimant;
        }
    }

    Color():
        Color.HSLA
    {
        return this.Claimant().Color();
    }
}
