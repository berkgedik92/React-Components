import React from 'react';
import './Badge.css';
import MyList from '../MyList/MyList'

export type BadgeProperties = {
    badgeId?: string;
    onChangeCallback?: any; 
    shouldDisplayElementPredicate?: any;
    placeholder?: string;
    isEditable?: boolean;
    freeTextAllowed?: boolean;
    showIcons?: boolean;
    badges: any[];
}

class Badge extends React.Component<BadgeProperties, any> {

    myListRef: any;
    badgeId?: string;
    onChangeCallback: any; 
    shouldDisplayElementPredicate: any;
    placeholder: string
    isEditable: boolean;
    freeTextAllowed: boolean;
    showIcons: boolean;
    badges: any[];

    constructor(props: BadgeProperties) {
        super(props);
        this.myListRef = React.createRef();
        this.badgeId = props.badgeId || null;
        this.onChangeCallback = props.onChangeCallback || function() {};
        this.placeholder = props.placeholder || "";
        this.isEditable = props.isEditable || false;
        this.freeTextAllowed = props.freeTextAllowed || false;
        this.showIcons = props.showIcons || false;
        this.shouldDisplayElementPredicate = props.shouldDisplayElementPredicate || function(elementName:string, elementId:string): boolean {return true;};
        this.state = {
            "isValid": true
        };
        this.badges = this.props.badges;
    }

    getValue(): string {
        return this.myListRef.current.getValue();
    }

    disable() {
        this.myListRef.current.disable();
    }

    enable() {
        this.myListRef.current.enable();
    }

    validityCheck(elements: any[]): boolean {
        let value = this.getValue().toUpperCase();
        let elementsUpper = elements.map(el => el.toUpperCase());
        let allBadgeIds = this.props.badges.map(badge => badge.id);

        if (value.length === 0) {
            this.setState(function(state: any, props: any) {
                return {
                    "isValid": false
                };
            });
            return false;
        }

        if (allBadgeIds.indexOf(value) === -1) {
            this.setState(function(state: any, props: any) {
                return {
                    "isValid": false
                };
            });
            return false;
        }

        if (elementsUpper.indexOf(value) !== elementsUpper.lastIndexOf(value) && elementsUpper.length > 1) {
            this.setState(function(state: any, props: any) {
                return {
                    "isValid": false
                };
            });
            return false;
        }

        this.setState(function(state: any, props: any) {
            return {
                "isValid": true
            };
        });
        return true;
    }

    render() {
        return (
            <div className="badge-outer" style={{"backgroundColor": this.state.isValid ? "unset" : "#dedede"}}>
                <div className="badge badge-name">
                    <MyList
                        ref={this.myListRef}
                        initialValueId={this.badgeId}
                        textAdjuster={function(text: string) {return text.toUpperCase();}}
                        onChangeCallback={this.onChangeCallback}
                        placeholder={this.placeholder}
                        isEditable={this.isEditable}
                        freeTextAllowed={this.freeTextAllowed}
                        showIcons={this.showIcons}
                        data={this.badges}
                        shouldDisplayElementPredicate={this.shouldDisplayElementPredicate}
                    />
                </div>
            </div>
        );
    };
};
export default Badge;
