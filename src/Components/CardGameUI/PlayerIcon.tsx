import React, { useContext } from 'react';
import './PlayerIcon.css';
import {GameContext} from './CardGameUIPage';

export type PlayerIconProperties = {
  readonly playerId: number;
  readonly pictureUrl: string;
  readonly cardCount: number;
}

export default function PlayerIcon(props: PlayerIconProperties) {

  const context = useContext(GameContext);
  let name: string = "Player";

  return (
    <div className="avatar_container">
      <div className="opponent_avatar" style={{ backgroundImage: `url("${context.baseImageUrl}${props.pictureUrl}")` }} />
      <div className="opponent_name noselect active">{name}</div>
      <div className="opponent_card_amount noselect">{props.cardCount}</div>
      <div className="opponent_card_icon" style={{ backgroundImage: `url("${context.baseImageUrl}images/BB.png")` }} />
    </div>
  );
}
