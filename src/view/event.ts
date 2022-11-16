import { Float } from "../types";

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

export const RESIZE: Event.Name_Affix = `Resize`;

export const START_EXHIBITIONS: Event.Name_Affix = `Start_Exhibitions`;
export const STOP_EXHIBITIONS: Event.Name_Affix = `Stop_Exhibitions`;
export const SWITCH_EXHIBITIONS: Event.Name_Affix = `Switch_Exhibitions`;
export const REMEASURE_EXHIBITIONS: Event.Name_Affix = `Remeasure_Exhibitions`;

export const START_NEW_GAME: Event.Name_Affix = `Start_New_Game`;
export const REMATCH_GAME: Event.Name_Affix = `Rematch_Game`;
export const EXIT_GAME: Event.Name_Affix = `Exit_Game`;
export const OPEN_TOP_MENU: Event.Name_Affix = `Open_Top_Menu`;
export const OPEN_OPTIONS_MENU: Event.Name_Affix = `Open_Options_Menu`;
export const OPEN_HELP_MENU: Event.Name_Affix = `Open_Help_Menu`;
export const DISABLE_MENUS: Event.Name_Affix = `Disable_Menus`;
export const SHOW_MENUS: Event.Name_Affix = `Show_Menus`;
export const HIDE_MENUS: Event.Name_Affix = `Hide_Menus`;
export const CLOSE_MENUS: Event.Name_Affix = `Close_Menus`;

export const GAME_START: Event.Name_Affix = `Game_Start`;// maybe ARENA_START and ARENA_STOP
export const GAME_STOP: Event.Name_Affix = `Game_Stop`;
export const SCROLL_PLAYER_NAMES: Event.Name_Affix = `Scroll_Player_Names`;
export const PLAYER_START_TURN: Event.Name_Affix = `Player_Start_Turn`;
export const PLAYER_STOP_TURN: Event.Name_Affix = `Player_Stop_Turn`;
export const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
export const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;
export const PLAYER_CHANGE_SCORE: Event.Name_Affix = `Player_Change_Score`;
export const BOARD_CHANGE_SCORE: Event.Name_Affix = `Board_Change_Score`;
export const BOARD_CHANGE_CELL: Event.Name_Affix = `Board_Change_Cell`;

// might want to turn these into full classes so that the sender has to fill out the info properly.
// that would mean changing how the event grid adds the event instance to the data.
// simple, just have these inherit from a base Event.Data type
export type Resize_Data = {
    width: Float;
    height: Float;
}

export type Start_Exhibitions_Data = {
    exhibition: Model.Exhibition.Instance;
}

export type Stop_Exhibitions_Data = {
}

export type Switch_Exhibitions_Data = {
    previous_exhibition: Model.Exhibition.Instance;
    current_exhibition: Model.Exhibition.Instance;
}

export type Remeasure_Exhibitions_Data = {
    measurement: Model.Enum.Measurement;
}

export type Start_New_Game_Data = {
}

export type Rematch_Game_Data = {
}

export type Exit_Game_Data = {
}

export type Open_Top_Menu_Data = {
}

export type Open_Options_Menu_Data = {
}

export type Open_Help_Menu_Data = {
}

export type Disable_Menus_Data = {
}

export type Show_Menus_Data = {
}

export type Hide_Menus_Data = {
}

export type Close_Menus_Data = {
}

export type Game_Start_Data = {
}

export type Game_Stop_Data = {
    scores: Model.Player.Scores;
}

export type Scroll_Player_Names_Data = {
    duration: Float;
    direction: Model.Enum.Direction;
}

export type Player_Start_Turn_Data = {
    player_index: Model.Player.Index;
}

export type Player_Stop_Turn_Data = {
    player_index: Model.Player.Index;
}

export type Player_Select_Stake_Data = {
    player_index: Model.Player.Index;
    stake_index: Model.Stake.Index;
}

export type Player_Place_Stake_Data = {
    player_index: Model.Player.Index;
    stake_index: Model.Stake.Index;
    cell_index: Model.Board.Cell.Index;
}

export type Player_Change_Score_Data = {
    player_index: Model.Player.Index;
    score_delta: Model.Player.Score.Delta;
}

export type Board_Change_Score_Data = {
    player_index_to_decrement: Model.Player.Index,
    player_index_to_increment: Model.Player.Index,
}

export type Board_Change_Cell_Data = {
    cell_index: Model.Board.Cell.Index;
    turn_result: Model.Turn_Results.Step.Instance;
}
