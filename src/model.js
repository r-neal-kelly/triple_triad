export default class Model
{
    constructor()
    {
        this.row_count = 3;
        this.column_count = 3;
        this.tile_count = this.row_count * this.column_count;
        this.hand_count = (this.tile_count + 1) / 2;
    }
};
