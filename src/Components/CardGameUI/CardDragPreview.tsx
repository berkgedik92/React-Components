import React from "react";
import { DragLayerMonitor, useDragLayer, XYCoord } from "react-dnd";
import CardUI, { CardStyle, DraggedCardData } from "./CardUI";

const CardMemo = React.memo(CardUI);

export default function CardDragPreview() {

    type CollectedProps = {
        isDragging: boolean;
        item: DraggedCardData;
        currentOffset: XYCoord | null;
    }

    const collectedProps: CollectedProps =
        useDragLayer((monitor: DragLayerMonitor<DraggedCardData>) => ({
            isDragging: monitor.isDragging(),
            item: monitor.getItem(),
            currentOffset: monitor.getSourceClientOffset()
        }));

    if (!collectedProps.isDragging || !collectedProps.currentOffset) {
        return null;
    }

    return (
        <div style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 100,
            left: collectedProps.currentOffset.x + "px",
            top: collectedProps.currentOffset.y + "px"
        }}>
            <CardMemo 
                cardData={collectedProps.item.cardData} 
                cardStyle={CardStyle.Standart} 
                groupName={""} 
                groupIndex={0} 
                index={1} 
                uiIndex={1} 
            />
        </div>
    );
};
