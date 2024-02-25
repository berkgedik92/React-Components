import React, { useContext } from 'react';
import './Table.css';
import TableCardGroup from './TableCardGroup';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { DraggedCardData } from './CardUI';
import Card from './Card';
import {GameContext} from './CardGameUIPage';

export type TableProperties = {
  tableCardGroups: Card[][];
};

export default function Table(props: TableProperties) {

  const context = useContext(GameContext);

  const canDropCard = function(item: DraggedCardData) {
    return true;
  }

  const[{isOver, isOverShallow, item}, drop] = useDrop
  <
    any,
    void,
    {isOver: boolean, isOverShallow: boolean, item: DraggedCardData}
  >
  ({
    accept: "card",
    canDrop: (item: DraggedCardData) => canDropCard(item),
    drop: (item: DraggedCardData, monitor: DropTargetMonitor) => cardDroppedToTable(item, monitor),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
      isOverShallow: !!monitor.isOver({ shallow: true }),
      item: monitor.getItem()
    })
  });

  function cardDroppedToTable(item: DraggedCardData, monitor: DropTargetMonitor) {
    if (!monitor.didDrop()) {
      context.cardDroppedToTable(item);
    }
  }

  let groupDom: any[] = [];
  
  let cardGroups: Card[][] = props.tableCardGroups;

  for (let i = 0; i < cardGroups.length; i++) {
    let group: Card[] = cardGroups[i];
    groupDom.push(
      <TableCardGroup
        key={i} 
        groupIndex={i}
        cardsProp={group}
        dragProcess={isOver}
        draggedCardData={item?.cardData}
      />
    );
  }

  return (
    <div ref={drop} className={`table ${isOverShallow ? "active_table" : "non_active_table"}`}>
      {groupDom}
    </div>
  );
}
