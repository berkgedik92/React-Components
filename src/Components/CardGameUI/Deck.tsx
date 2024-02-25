import React from 'react';
import CardUI, { CardStyle } from './CardUI';
import './Deck.css';
import StandardCard from './StandardCard';

const CardMemo = React.memo(CardUI);

export type DeckProps = {
    cardCount: number;
    deckClicked: () => void;
}

export default function Deck(props: DeckProps) {
    return (
        <div className="deck-container" onClick={() => props.deckClicked()}>
            <div className="deck-card-count">{props.cardCount}</div>
            <CardMemo
                cardData={new StandardCard("B", "B", false, 1)} 
                cardStyle={CardStyle.Standart} 
                groupName={"deck"} 
                groupIndex={1}
                uiIndex={1}
                index={1}
            />
        </div>
    );
}
