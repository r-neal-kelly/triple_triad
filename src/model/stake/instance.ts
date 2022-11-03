
import * as Card from "../card";
import * as Color from "../color";
import * as Arena from "../arena";
import * as Board from "../board";
import * as Player from "../player";

/*
    Contains a card either on a player or on the board, and its origin.
    It's important to keep track of the origin so that after a game,
    if another player has claimed the card, they may possibly be able
    to remove this card from the origin collection and put it into their own.
*/
export class Instance
{
    private origin: Player.Instance;
    private card: Card.Instance;

    constructor(
        {
            origin,
            card,
        }: {
            origin: Player.Instance,
            card: Card.Instance,
        },
    )
    {
        this.origin = origin;
        this.card = card;

        Object.freeze(this);
    }

    Arena():
        Arena.Instance
    {
        return this.Origin().Arena();
    }

    Board():
        Board.Instance
    {
        return this.Origin().Arena().Board();
    }

    Origin():
        Player.Instance
    {
        return this.origin;
    }

    Is_Of_Human():
        boolean
    {
        return this.Origin().Is_Human();
    }

    Is_Of_Computer():
        boolean
    {
        return !this.Is_Of_Human();
    }

    Card():
        Card.Instance
    {
        return this.card;
    }

    Color():
        Color.Instance
    {
        return this.Origin().Color();
    }

    Is_On_Player():
        boolean
    {
        return this.Origin().Has_Stake(this);
    }

    Is_On_Board():
        boolean
    {
        return !this.Is_On_Player();
    }

    Is_Selected():
        boolean
    {
        return this.Origin().Selected_Stake() === this;
    }

    Is_Selectable():
        boolean
    {
        return !this.Is_Selected() && this.Is_On_Player() && this.Origin().Is_On_Turn();
    }
}
