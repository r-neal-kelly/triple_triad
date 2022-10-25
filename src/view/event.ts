import * as Event from "../event";

import * as Model from "../model";

export { Grid } from "../event";
export { Name } from "../event";
export type Name_Prefix = Event.Name_Prefix;
export type Name_Affix = Event.Name_Affix;
export type Name_Suffix = Event.Name_Suffix;
export type Handler = Event.Handler;
export type Listener_Info = Event.Listener_Info;
export type Listener_Handle = Event.Listener_Handle;
export type Info = Event.Info;
export type Data = Event.Data;
export type Instance = Event.Instance;

export const BEFORE: Event.Name_Prefix = Event.BEFORE;
export const ON: Event.Name_Prefix = Event.ON;
export const AFTER: Event.Name_Prefix = Event.AFTER;

export const START_EXHIBITIONS: Event.Name_Affix = `Start_Exhibitions`;
export const STOP_EXHIBITIONS: Event.Name_Affix = `Stop_Exhibitions`;
export const SWITCH_EXHIBITION: Event.Name_Affix = `Switch_Exhibition`;

export const START_NEW_GAME: Event.Name_Affix = `Start_New_Game`;
export const EXIT_GAME: Event.Name_Affix = `Exit_Game`;
export const OPEN_TOP_MENU: Event.Name_Affix = `Open_Top_Menu`;
export const OPEN_OPTIONS_MENU: Event.Name_Affix = `Open_Options_Menu`;

export const GAME_START: Event.Name_Affix = `Game_Start`;
export const GAME_STOP: Event.Name_Affix = `Game_Stop`;
export const PLAYER_START_TURN: Event.Name_Affix = `Player_Start_Turn`;
export const PLAYER_STOP_TURN: Event.Name_Affix = `Player_Stop_Turn`;
export const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
export const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;
export const BOARD_CHANGE_CELL: Event.Name_Affix = `Board_Change_Cell`;

// might want to turn these into full classes so that the sender has to fill out the info properly.
// that would mean changing how the event grid adds the event instance to the data.
// simple, just have these inherit from a base Event.Data type
export type Start_New_Game_Data = {
}

export type Exit_Game_Data = {
}

export type Open_Top_Menu_Data = {
}

export type Open_Options_Menu_Data = {
}

export type Switch_Exhibition_Data = {
    previous: Model.Exhibition,
    next: Model.Exhibition,
}

export type Game_Start_Data = {
}

export type Game_Stop_Data = {
    scores: Model.Scores;
}

export type Player_Start_Turn_Data = {
    player_index: Model.Player_Index;
}

export type Player_Stop_Turn_Data = {
    player_index: Model.Player_Index;
}

export type Player_Select_Stake_Data = {
    player_index: Model.Player_Index;
    stake_index: Model.Stake_Index;
}

export type Player_Place_Stake_Data = {
    player_index: Model.Player_Index;
    stake_index: Model.Stake_Index;
    cell_index: Model.Cell_Index;
}

export type Board_Change_Cell_Data = {
    cell_index: Model.Cell_Index;
    turn_result: Model.Turn_Result;
}
