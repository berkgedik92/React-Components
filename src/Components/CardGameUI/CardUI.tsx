import { useEffect, useRef, useState, useContext } from 'react';
import './Card.css';
import { ConnectDragPreview, ConnectDragSource, DragSourceMonitor, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend";
import React from 'react';
import Card from './Card';
import {GameContext} from './CardGameUIPage';

export class DraggedCardData {
    readonly cardData: Card;
    readonly index: number;
    readonly uiIndex: number;
    readonly groupName: string;
    readonly groupIndex: number;
    readonly orderCardsCallback?: (i1: number, i2: number) => void;    

    constructor(cardData: Card, 
                groupName: string,
                groupIndex: number,
                index: number,
                uiIndex: number, 
                orderCardsCallback?: (i1: number, i2: number) => void) {
        this.cardData = cardData;
        this.groupName = groupName;
        this.groupIndex = groupIndex;
        this.index = index;
        this.uiIndex = uiIndex;
        this.orderCardsCallback = orderCardsCallback;
    } 
}

export type CardProperties = {
    readonly cardStyle: CardStyle;
    readonly cardData: Card;
    readonly index: number;
    readonly uiIndex: number;
    readonly groupName: string;
    readonly groupIndex: number;
    readonly orderCardsCallback?: (i1: number, i2: number) => void;
}

export enum CardStyle {
    Standart = "standart",
    Big = "big"
}

type CollectedProps = {
    opacity: number;
}

export default function CardUI(props: CardProperties) {

    const context = useContext(GameContext);
    const [left, setLeft] = useState(false);
    const [right, setRight] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const [collectedProps, drag, dragPreview]: [CollectedProps, ConnectDragSource, ConnectDragPreview] = useDrag(
        {
            type: "card",
            item: new DraggedCardData(props.cardData, props.groupName, props.groupIndex, props.index, props.uiIndex, props.orderCardsCallback),
            canDrag: (monitor: DragSourceMonitor) => {
                return true;
            },
            collect: (monitor: DragSourceMonitor) => ({
                opacity: monitor.isDragging() ? 0 : 1
            })
        });

    const [{ isOver }, drop] = useDrop<
        DraggedCardData,
        void,
        { isOver: boolean }
      >({
        accept: "card",
        collect(monitor) {
          return {
            isOver: monitor.isOver()
          }
        },
        hover(item: DraggedCardData, monitor) {
            if (!ref.current) {
                return;
            }

            const dragIndex = item.uiIndex;
            const hoverIndex = props.uiIndex;

            // Here we go to else-if or else block only when moving cards in Hand. 
            if (dragIndex === hoverIndex) {
                setRight(false);
                setLeft(false);
            }
            else if (dragIndex > hoverIndex) {
                setRight(false);
                setLeft(true);
            }
            else {
                setLeft(false);
                setRight(true);
            }
        },
        drop(item: DraggedCardData, monitor) {
            if (!ref.current) {
                return;
            }

            const dragIndex = item.uiIndex;
            const hoverIndex = props.uiIndex;

            if (dragIndex === hoverIndex) {
                return;
            }

            if (item.orderCardsCallback) {
                item.orderCardsCallback(dragIndex, hoverIndex);
            }
        }
      })

    // This is to disable the default "preview" element (element that appears during drag&drop)
    useEffect(() => {
        dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [dragPreview]);

    drag(drop(ref));

    let cardImage = "";
    if (props.cardData.getAttribute("isJoker") === true) {
        cardImage = "RX";
    }
    else {
        cardImage = props.cardData.getAttribute("rank") + "" + props.cardData.getAttribute("suit");
    }

    return (
        <div className="game-card-container" style={{display: "inline-block"}} ref={ref}>
            <div className={`placeholder ${props.cardStyle}`} style={{display: (left && isOver) ? "inline-block" : "none"}}></div>
            <div
                style={{ opacity: collectedProps.opacity, backgroundImage: `url("${context.baseImageUrl}images/${cardImage}.png")` }}
                className={`card ${props.cardStyle}`} />
            <div className={`placeholder ${props.cardStyle}`} style={{display: (right && isOver) ? "inline-block" : "none"}}></div>
        </div>
    );
}
