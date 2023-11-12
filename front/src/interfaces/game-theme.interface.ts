import { RenderColor } from "../game_pong/game_pong.interfaces";

type GameTheme = {
  name: string;
  id: string;
  backgroundImg: string;
  ballColor: RenderColor;
  hitSound: HTMLAudioElement;
};

export default GameTheme;
