import './Hand.css';
import CardUI, { CardStyle } from './CardUI';
import Card from './Card';
import React, { useRef } from 'react';

export type HandProps = {
  readonly handCards: Card[]
  readonly cardStyle: CardStyle;
  readonly isSortable: boolean;
  readonly groupIndex: number;
  readonly handCardsOrdered: (cards: Card[]) => void;
}

function Hand(props: HandProps) {

  let handRef = useRef(null);
  let leftRef = useRef(null);
  let rightRef = useRef(null);

  const cardToId = (card: Card): string => {
    return card.getAttribute("deck") + "_" + card.getAttribute("rank") + "" + card.getAttribute("suit");
  }

  const computeHandWidth = (): string => {
    // According to the current CSS style (a card has width 100px and each card has margin-right -40px)
    // But we also want to give some margin so when we pick a card from the deck it will move to an empty
    // space, rather than on top of the last existing card in hand
    if (props.handCards.length <= 1) {
      return "200px";
    }
    return (200 + (props.handCards.length - 1) * 60) + "px";
  }

  const orderCardsCallback = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) {
      return;
    }

    // For some reason indices are starting from 1, not 0 so we have to adjust them here
    dragIndex -= 1;
    hoverIndex -= 1;

    let newOrdering: Card[] = [];
    if (dragIndex > hoverIndex) {
      newOrdering = [
        ...props.handCards.slice(0, hoverIndex),
        props.handCards[dragIndex],
        ...props.handCards.slice(hoverIndex, dragIndex),
        ...props.handCards.slice(dragIndex + 1, props.handCards.length)
      ]; 
    }
    else {
      newOrdering = [
        ...props.handCards.slice(0, dragIndex),
        ...props.handCards.slice(dragIndex + 1, hoverIndex + 1),
        props.handCards[dragIndex],
        ...props.handCards.slice(hoverIndex + 1, props.handCards.length),
      ];
    }

    props.handCardsOrdered(newOrdering);
  };

  const shouldAllowRight = () => {
    if (!handRef.current) {
      return true;
    }
    let currentLeft: number = handRef.current.scrollLeft;
    let outerWidth: number = handRef.current.getBoundingClientRect().width - 60;
    if (60 * props.handCards.length - outerWidth <= currentLeft) {
      return false;
    }
    return true;
  }

  const shouldAllowLeft = () => {
    if (!handRef.current) {
      return false;
    }
    let currentLeft: number = handRef.current.scrollLeft;
    if (currentLeft <= 0) {
      return false;
    }
    return true;
  }

  const scrollRightByButton = () => {
    if (!shouldAllowRight()) {
      return;
    }
    handRef.current.scrollLeft += 60;
  }

  const scrollLeftByButton = () => {
    if (!shouldAllowLeft()) {
      return;
    }
    handRef.current.scrollLeft -= 60;
  }

  const cardsDom: any[] = [];
  let handCards: Card[] = props.handCards;
  let cardIds: Array<string> = handCards.map((card: Card) => cardToId(card));

  for (let i = 0; i < handCards.length; i++) {
    let currentCard: Card = handCards[i];
    let cardId = cardToId(currentCard);
    let index = cardIds.indexOf(cardId);
    cardsDom.push(
      <CardUI
        index={index + 1}
        uiIndex={i + 1}
        key={cardId}
        cardData={currentCard}
        cardStyle={props.cardStyle}
        orderCardsCallback={(i1: number, i2: number) => orderCardsCallback(i1, i2)} 
        groupName={"player_hand"} 
        groupIndex={props.groupIndex}      
      />);
  }

  return (
    <div className="hand-with-scroll-buttons">
      <div 
        className="scroll-helper scroll-left" 
        ref={leftRef} 
        onClick={scrollLeftByButton}>&lt;</div>
      <div className="hand-outer" ref={handRef}>
        <div className="hand" style={{ width: computeHandWidth() }}>
          {cardsDom}
        </div>
      </div>
      <div 
        className="scroll-helper scroll-right" 
        ref={rightRef} 
        onClick={scrollRightByButton}>&gt;</div>
    </div>
  );
};

export default Hand;
