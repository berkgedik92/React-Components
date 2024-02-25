import React from 'react';
import './MutableContainer.css';

export type MutableContainerProperties = {
    elementGenerator: any;
    newElementDataProvider: any;
    canHaveNewElementPredicate?: any;
    initialItems: any[];
    isEditable: boolean;
    onChangeCallback?: any;
}

class MutableContainer extends React.Component<MutableContainerProperties, any> {

    elementGenerator: any;
    newElementDataProvider: any;
    canHaveNewElementPredicate: any;
    initialItems: any[];
    isEditable: boolean;

    constructor(props: MutableContainerProperties) {
        super(props);
        this.elementGenerator = props.elementGenerator;
        this.newElementDataProvider = props.newElementDataProvider;
        this.canHaveNewElementPredicate = props.canHaveNewElementPredicate || function(elements: any[]) {return true;};
        this.initialItems = props.initialItems;
        this.isEditable = props.isEditable;

        this.onChangeCallback = this.onChangeCallback.bind(this);
        this.addElementButtonDomClicked = this.addElementButtonDomClicked.bind(this);
        this.removeItemClicked = this.removeItemClicked.bind(this);

        let elementsData: any[] = [];
        let elementsRef: any[] = [];
        let keys: number[] = [];

        for (let i = 0; i < this.initialItems.length; i++) {
            elementsData.push(this.initialItems[i]);
            elementsRef.push(React.createRef());
            keys.push(i);
        }

        this.state = {
            "currentKey": elementsData.length,
            "keys": keys,
            "isEditable": props.isEditable,
            "elementsData": elementsData,
            "elementsRef": elementsRef,
            "shouldDisplayAddButton": true
        };
    }

    enableEdit() {
        let allValues = this.getValues();
        let allOk = true;
        for (let i = 0; i < this.state.elementsRef.length; i++) {
            this.state.elementsRef[i].current.enable();
            let elementOk = this.state.elementsRef[i].current.validityCheck(allValues);
            allOk = allOk && elementOk;
        }
        let shouldDisplayAddButton = allOk && this.canHaveNewElementPredicate(allValues);
        this.setState(function(state: any, props: any) {
            return {
                "isEditable": true,
                "shouldDisplayAddButton": shouldDisplayAddButton
            }
        });
    }

    disableEdit() {
        for (let i = 0; i < this.state.elementsRef.length; i++) {
            this.state.elementsRef[i].current.disable();
        }
        this.setState(function(state: any, props: any) {
            return {
                "isEditable": false
            }
        });
    }

    getValues(): any[] {
        let result: any[] = [];
        for (let i = 0; i < this.state.elementsRef.length; i++) {
            if (this.state.elementsRef[i].current) {
                result.push(this.state.elementsRef[i].current.getValue());
            }
        }
        return result;
    }

    areAllElementsValid () {
        let allValues = this.getValues();
        for (let i = 0; i < this.state.elementsRef.length; i++) {
            if (!this.state.elementsRef[i].current.validityCheck(allValues)) {
                return false;
            }
        }
        return true;
    }

    onChangeCallback = function() {
        let instance = this;
        let allValues = this.getValues();
        let allOk = true;
        for (let i = 0; i < this.state.elementsRef.length; i++) {
            let elementOk = this.state.elementsRef[i].current.validityCheck(allValues);
            allOk = allOk && elementOk;
        }
        let shouldDisplayAddButton = allOk && this.canHaveNewElementPredicate(allValues);
        this.setState(function(state: any, props: any) {
            return {
                "shouldDisplayAddButton": shouldDisplayAddButton
            }
        }, function() {
            if (instance.props.onChangeCallback) {
                instance.props.onChangeCallback();
            }
        });
    }

    addElementButtonDomClicked() {
        if (this.getValues().indexOf("") !== -1) {
            return;
        }

        let instance = this;
        this.setState(function(state: any, props: any) {
            return {
                "elementsData": [...state.elementsData, instance.newElementDataProvider()],
                "elementsRef": [...state.elementsRef, React.createRef()],
                "keys": [...state.keys, state.currentKey],
                "currentKey": state.currentKey + 1,
                "shouldDisplayAddButton": false
            };
        }, function() {
            let allValues = instance.getValues();
            for (let i = 0; i < instance.state.elementsRef.length; i++) {
                instance.state.elementsRef[i].current.enable();
                instance.state.elementsRef[i].current.validityCheck(allValues);
            }
        });
    }

    removeItemClicked(index: number) {
        let instance = this;
        this.setState(function(state: any, props: any) {
            let newElementsData: any[] = [...instance.getValues()];
            let newElementsRef: any[] = [...state.elementsRef];
            let newKeys: number[] = [...state.keys];

            newElementsData.splice(index, 1);
            newElementsRef.splice(index, 1);
            newKeys.splice(index, 1);

            let allOk = true;
            for (let i = 0; i < newElementsRef.length; i++) {
                let elementOk = newElementsRef[i].current.validityCheck(newElementsData);
                allOk = allOk && elementOk;
            }
            let shouldDisplayAddButton = allOk && this.canHaveNewElementPredicate(newElementsData);
            return {
                "elementsData": newElementsData,
                "elementsRef": newElementsRef,
                "shouldDisplayAddButton": shouldDisplayAddButton,
                "keys": newKeys
            };
        }, function() {
            let allValues = instance.getValues();
            for (let i = 0; i < instance.state.elementsRef.length; i++) {
                instance.state.elementsRef[i].current.validityCheck(allValues);
            }
            if (instance.props.onChangeCallback) {
                instance.props.onChangeCallback();
            }
        });
    }

    render() {
        if (!this.state.elementsData) {
            return (<div></div>);
        }
        let instance = this;
        let elements: any[] = [];

        for (let i = 0; i < this.state.elementsData.length; i++) {
            let el = (
                <div key={this.state.keys[i]} className="mutable-list-element">
                    {instance.elementGenerator(instance.state.elementsData[i], instance.onChangeCallback, function() {return instance.getValues();}, instance.state.elementsRef[i])}
                    <div className="remove-item" onClick={() => instance.removeItemClicked(i)} style={this.state.isEditable ? {"display": "inline-flex"} : {"display": "none"}}/>
                </div>
            );
            elements.push(el);
        }

        let addElementButtonStyle: any = {};
        addElementButtonStyle["visibility"] = this.state.shouldDisplayAddButton ? "visible" : "hidden";
        addElementButtonStyle["display"] = this.state.isEditable ? "inline-flex" : "none";

        return (
            <div className="element-container">
                {elements}    
                <div className="add-item" onClick={this.addElementButtonDomClicked} style={addElementButtonStyle}></div>
            </div>
        );
    };
};
export default MutableContainer;
