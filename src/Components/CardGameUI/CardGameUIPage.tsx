import React, { useRef, createContext, useState } from 'react';
import './CardGameUIPage.css';
import CardUI, { CardStyle, DraggedCardData } from './CardUI';
import CardDragPreview from './CardDragPreview';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import StandardCard from './StandardCard';
import Card from './Card';
import Hand from './Hand';
import Table from './Table';
import Deck from './Deck';
import PlayerIcon from './PlayerIcon';

const CardMemo = React.memo(CardUI);

const shuffle = (array: Card[]) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
};

const createAllCards = () => {
  let allCards: Card[] = [];
  for (let i = 0; i < ranks.length; i++) {
    for (let j = 0; j < suits.length; j++) {
      allCards.push(new StandardCard(ranks[i], suits[j], false, 1));
    }
  }
  return shuffle(allCards);
} 

const ranks: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const suits: string[] = ["C", "D", "H", "S"];

export type GameContextProperties = {
  cardDroppedToTable: (item: DraggedCardData) => void;
  cardDroppedToTheLeftOfTableGroup: (item: DraggedCardData, tableGroupIndex: number) => void;
  cardDroppedToTheRightOfTableGroup: (item: DraggedCardData, tableGroupIndex: number) => void;
  baseImageUrl: string;
  animationOngoing: any;
}

export const GameContext = createContext(null);

function CardGameUIPage() {

  let allCards: Card[] = createAllCards();
  const [hand, setHand] = useState<Card[]>(allCards.slice(0, 20));
  const [deck, setDeck] = useState<Card[]>(allCards.slice(20, allCards.length));
  const [table, setTable] = useState<Card[][]>([]);

  const animationOngoing = useRef<boolean>(false);

  let animationCardContainer: HTMLDivElement;
  let deckContainerRef: any = useRef<HTMLDivElement>(null);
  let handRef: any = useRef<HTMLDivElement>(null);

  const removeCardFromCardGroup = function(card: Card, cardGroup: Card[]) {
    cardGroup.splice(cardGroup.indexOf(card), 1);
  }

  const removeCardFromTableGroup = function(card: Card, newTable: Card[][], tableGroupIndex: number) {
    let newTableGroup: Card[] = [...newTable[tableGroupIndex]];
    removeCardFromCardGroup(card, newTableGroup);
    newTable[tableGroupIndex] = newTableGroup;
  }

  const cardDroppedToTable = function(item: DraggedCardData) {
    if (animationOngoing.current) {
      return;
    }

    let newHand = hand;
    let newTable = table;

    if (item.groupName === "player_hand") {
      newHand = [...hand]
      removeCardFromCardGroup(item.cardData, newHand);
    }
    else {
      newTable = [...table];
      removeCardFromTableGroup(item.cardData, newTable, item.groupIndex);
    }
    
    newTable = [...newTable, [item.cardData]];
    
    setHand(newHand);
    setTable(newTable);
  }

  const cardDroppedToTheLeftOfTableGroup = function(item: DraggedCardData, tableGroupIndex: number) {
    if (animationOngoing.current) {
      return;
    }

    let newHand = hand;
    let newTable = table;

    if (item.groupName === "player_hand") {
      newHand = [...hand];
      removeCardFromCardGroup(item.cardData, newHand);
    }
    else {
      newTable = [...table];
      removeCardFromTableGroup(item.cardData, newTable, item.groupIndex);
    }

    let newTableCardGroup: Card[] = [item.cardData, ...newTable[tableGroupIndex]];

    newTable = [
      ...newTable.slice(0, tableGroupIndex), 
      newTableCardGroup,
      ...newTable.slice(tableGroupIndex + 1, newTable.length) 
    ];

    setHand(newHand);
    setTable(newTable);
  }

  const cardDroppedToTheRightOfTableGroup = function(item: DraggedCardData, tableGroupIndex: number) {
    if (animationOngoing.current) {
      return;
    }

    let newHand = hand;
    let newTable = table;

    if (item.groupName === "player_hand") {
      newHand = [...hand];
      removeCardFromCardGroup(item.cardData, newHand);
    }
    else {
      newTable = [...table];
      removeCardFromTableGroup(item.cardData, newTable, item.groupIndex);
    }

    let newTableCardGroup: Card[] = [...newTable[tableGroupIndex], item.cardData];

    newTable = [
      ...newTable.slice(0, tableGroupIndex), 
      newTableCardGroup,
      ...newTable.slice(tableGroupIndex + 1, newTable.length) 
    ];

    setHand(newHand);
    setTable(newTable);
  }

  const handCardsOrderedCallback = function(cards: Card[]) {
    if (animationOngoing.current) {
      return;
    }
    setHand(cards);
  }

  const deckClickedCallback = function() {
    if (deck.length === 0 || animationOngoing.current) {
      return;
    }

    animationOngoing.current = true;
    const scrollWidth = handRef.current.childNodes[0].childNodes[1].scrollWidth;
    const width = handRef.current.childNodes[0].childNodes[1].clientWidth;
    const maxScrollLeft = scrollWidth - width;
    handRef.current.childNodes[0].childNodes[1].scrollLeft = maxScrollLeft > 0 ? maxScrollLeft : 0;
    animationCardContainer.classList.add("animateFromDeckToPlayerHand")
    return new Promise<void>(resolve => {
      setTimeout(function() {
        animationCardContainer.classList.remove("animateFromDeckToPlayerHand");
        resolve();
      }, 1200);
    }).then(() => {
      let pickedCard: Card = deck[0];
      let newDeck: Card[] = [...deck];
      let newHand: Card[] = [...hand, pickedCard];
      removeCardFromCardGroup(pickedCard, newDeck);
      setDeck(newDeck);
      setHand(newHand);
      animationOngoing.current = false;
    });
  }

  let context: GameContextProperties = {
    "cardDroppedToTable": cardDroppedToTable,
    "cardDroppedToTheLeftOfTableGroup": cardDroppedToTheLeftOfTableGroup,
    "cardDroppedToTheRightOfTableGroup": cardDroppedToTheRightOfTableGroup,
    "baseImageUrl": "http://localhost:3000/",
    "animationOngoing": animationOngoing
  };

  return (
    <GameContext.Provider value={context}>
      <DndProvider backend={HTML5Backend}>
        <CardDragPreview />
        <div className="card-game-explanation">Simple UI to demonstrate drag&drop features. User can drag a card from his hand to the table to form a new group on the table, 
        or can drag from hand/table to a card near another card on the table to make a group where these cards appear together, or pick a card from deck or change the order of
        cards in the hand. Since there are no rules check, any card can be together with any card on the table.</div>
        <div 
          id="animationCard" 
          ref={(div) => { animationCardContainer = div! }}>
          <CardMemo 
            cardData={new StandardCard("B", "B", false, 1)} 
            cardStyle={CardStyle.Big} 
            groupName={''} 
            groupIndex={0} 
            uiIndex={1} 
            index={1} />
        </div>
        <div id="kastet_game">
          <div id="kastet_table_container">
            <Table tableCardGroups={table}/>
          </div>
          <div id="bottom_part">
            <div id="player_container">
              <div className="player_icon">
                <PlayerIcon
                  playerId={1}
                  pictureUrl={"images/woman.png"} 
                  cardCount={hand.length}
                />
              </div>
            </div>
            <div id="player_hand_container" ref={(div) => { handRef.current = div! }}>
              <Hand
                handCards={hand}
                handCardsOrdered={handCardsOrderedCallback}
                isSortable={true} 
                cardStyle={CardStyle.Big} 
                groupIndex={1} />
            </div>
            <div id="deck_container">
              <div id="deck" ref={(div) => { deckContainerRef.current = div! }}>
                <Deck cardCount={deck.length} deckClicked={deckClickedCallback}/>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </GameContext.Provider>);
}
export default CardGameUIPage;
