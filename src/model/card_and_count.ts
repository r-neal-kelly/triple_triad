import * as Card from "./card";

/* Contains a particular card and a count thereof. */
export class Card_And_Count
{
    private card: Card.Instance;
    private count: Card.Count;

    constructor(
        {
            card,
            count,
        }: {
            card: Card.Instance,
            count: Card.Count,
        },
    )
    {
        if (count >= 0) {
            this.card = card;
            this.count = count;
        } else {
            throw new Error(`count must be greater than or equal to 0.`);
        }
    }

    Card():
        Card.Instance
    {
        return this.card;
    }

    Count():
        Card.Count
    {
        return this.count;
    }

    Add(card_count: Card.Count):
        void
    {
        if (this.count + card_count < this.count) {
            throw new Error(`Cannot add ${card_count} to the count.`);
        } else {
            this.count += card_count;
        }
    }

    Subtract(card_count: Card.Count):
        void
    {
        if (this.count - card_count > this.count) {
            throw new Error(`Cannot subtract ${card_count} from the count.`);
        } else {
            this.count -= card_count;
        }
    }

    Increment():
        void
    {
        this.Add(1);
    }

    Decrement():
        void
    {
        this.Subtract(1);
    }
}
