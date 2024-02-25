import React, { useContext } from 'react';
import './TableCardGroup.css';
import CardUI, { CardStyle, DraggedCardData } from './CardUI';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import Card from './Card';
import {GameContext} from './CardGameUIPage';

const CardMemo = React.memo(CardUI);

export type TableCardGroupProps = {
  readonly cardsProp: Array<Card>;
  readonly dragProcess: boolean;
  readonly groupIndex: number;
  readonly draggedCardData?: Card;
  readonly ref?: any;
}

export default function TableCardGroup(props: TableCardGroupProps) {

  const context = useContext(GameContext);

  const canDropCardToTableCardGroup = function(item: DraggedCardData) {
    return true;
  }

  const dropCardToLeftOfTableCardGroup = function(item: DraggedCardData) {
    context.cardDroppedToTheLeftOfTableGroup(item, props.groupIndex);
  }

  const dropCardToRightOfTableCardGroup = function(item: DraggedCardData) {
    context.cardDroppedToTheRightOfTableGroup(item, props.groupIndex);
  }

  const dropCardToBottomOfTableCardGroup = function(item: DraggedCardData) {
    context.cardDroppedToTheBottomOfTableGroup(item, props.groupIndex);
  }

  const [{isOverLeftPlaceholder}, leftPlaceholderRef] = useDrop({
    accept: "card",
    canDrop: (item: DraggedCardData, monitor: DropTargetMonitor) => canDropCardToTableCardGroup(item),
    drop: (item: DraggedCardData, monitor: DropTargetMonitor) => dropCardToLeftOfTableCardGroup(item),
    collect: (monitor: DropTargetMonitor) => ({
      isOverLeftPlaceholder: !!monitor.isOver()
    })
  });

  const [{isOverRightPlaceholder}, rightPlaceholderRef] = useDrop({
    accept: "card",
    canDrop: (item: DraggedCardData, monitor: DropTargetMonitor) => canDropCardToTableCardGroup(item),
    drop: (item: DraggedCardData, monitor: DropTargetMonitor) => dropCardToRightOfTableCardGroup(item),
    collect: (monitor: DropTargetMonitor) => ({
      isOverRightPlaceholder: !!monitor.isOver()
    })
  });

  const [{isOverBottomPlaceholder}, bottomPlaceholderRef] = useDrop({
    accept: "card",
    canDrop: (item: DraggedCardData, monitor: DropTargetMonitor) => canDropCardToTableCardGroup(item),
    drop: (item: DraggedCardData, monitor: DropTargetMonitor) => dropCardToBottomOfTableCardGroup(item),
    collect: (monitor: DropTargetMonitor) => ({
      isOverBottomPlaceholder: !!monitor.isOver()
    })
  });

  const cardsDom: any[] = [];

  for (let j = 0; j < props.cardsProp.length; j++) {
    let cardId = props.cardsProp[j].getAttribute("deck") + "_" + props.cardsProp[j].getAttribute("rank") + "" + props.cardsProp[j].getAttribute("suit");
    cardsDom.push(
      <div key={cardId} className="card_container">
        <CardMemo
          uiIndex={j + 1}
          index={j + 1}
          cardData={props.cardsProp[j]}
          cardStyle={CardStyle.Standart}
          groupName="table_group" 
          groupIndex={props.groupIndex}
        />
      </div>);
  }

  if (cardsDom.length === 0) {
    return null;
  }

  let shouldShowBottomPlaceholder = false;
  let impacted = false;

  return (
      <div className="group" style={{border: impacted ? "2px dashed red": "none"}}>
        <div key="left" className={`front left ${props.dragProcess ? "show" : "hide"}`} ref={leftPlaceholderRef}/>
        <div key="backLeft" className={`back left ${isOverLeftPlaceholder ? "active" : "non_active"} ${props.dragProcess ? "show" : "hide"}`}/>
        {cardsDom}
        <div key="right" className={`front right ${props.dragProcess ? "show" : "hide"}`} ref={rightPlaceholderRef}/>
        <div key="backRight" className={`back right ${isOverRightPlaceholder ? "active" : "non_active"} ${props.dragProcess ? "show" : "hide"}`}/>
        <div key="bottom" className={`front bottom ${props.dragProcess && shouldShowBottomPlaceholder ? "show" : "hide"}`} ref={bottomPlaceholderRef}/>
        <div key="backBottom" className={`back bottom ${isOverBottomPlaceholder ? "active" : "non_active"} ${props.dragProcess && shouldShowBottomPlaceholder ? "show" : "hide"}`}/>
      </div>
    );
};
