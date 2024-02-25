import React from 'react';
import './BadgesPage.css';
import Badge from './Badge'
import MutableContainer from '../MutableContainer/MutableContainer'

class BadgesPage extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {};
        this.createBadge = this.createBadge.bind(this);
        this.shouldDisplayBadge = this.shouldDisplayBadge.bind(this);
        this.canAddNewBadge = this.canAddNewBadge.bind(this);
    }

    changeCallback() {}

    createBadge(badgeId: any, changeCallback: any, allElementsProvider: any, ref: any): any {
        return (<Badge 
            badgeId={badgeId}
            badges={this.getAllBadgesWithLanguage("English")}
            onChangeCallback={changeCallback}
            shouldDisplayElementPredicate={(elementName: string, elementId: string) => this.shouldDisplayBadge(elementName, elementId, allElementsProvider)}
            placeholder="Enter value"
            isEditable={true}
            freeTextAllowed={false}
            showIcons={false}
            ref={ref}
        />);
    }

    getAllBadgesWithLanguage(language: string): any[] {
        let response = this.getAllBadges();
        return response.map((item: any) => {
            return {
                "id": item.id,
                "text": item.text[language]
            };
        });
    }

    shouldDisplayBadge(elementName: string, elementId: string, allElementsProvider: any) {
        let coveredCategories = new Set();
        let allElements = allElementsProvider().filter((el: any) => el);
        for (let i = 0; i < allElements.length; i++) {
            coveredCategories.add(this.getBadgeToCategory()[allElements[i]]);
        }
        let currentElementCategory = this.getBadgeToCategory()[elementId.toUpperCase()];
        return !(coveredCategories.has(currentElementCategory));
    }

    getBadgeToCategory(): any {
        return {
            "EASY": "DIFFICULTY",
            "MEDIUM": "DIFFICULTY",
            "HARD": "DIFFICULTY",
            "RED": "COLOR",
            "GREEN": "COLOR",
            "YELLOW": "COLOR",
            "SOLID": "STATE",
            "LIQUID": "STATE",
            "GAS": "STATE"
        };
    }

    getAllBadges(): any[] {
        return [
            {
                "id": "EASY",
                "text": {
                    "English": "EASY"
                }
            },
            {
                "id": "MEDIUM",
                "text": {
                    "English": "MEDIUM"
                }
            },
            {
                "id": "HARD",
                "text": {
                    "English": "HARD"
                }
            },
            {
                "id": "RED",
                "text": {
                    "English": "RED"
                }
            },
            {
                "id": "GREEN",
                "text": {
                    "English": "GREEN"
                }
            },
            {
                "id": "YELLOW",
                "text": {
                    "English": "YELLOW"
                }
            },
            {
                "id": "SOLID",
                "text": {
                    "English": "SOLID"
                }
            },
            {
                "id": "LIQUID",
                "text": {
                    "English": "LIQUID"
                }
            },
            {
                "id": "GAS",
                "text": {
                    "English": "GAS"
                }
            }
        ];
    }

    getAllBadgeCategories(): string[] { 
        return ["DIFFICULTY", "CATEGORY2", "CATEGORY3"];
    }

    canAddNewBadge(elements: any): boolean {
        let coveredCategories = new Set();
        for (let i = 0; i < elements.length; i++) {
            coveredCategories.add(this.getBadgeToCategory()[elements[i]]);
        }
        if (coveredCategories.size === this.getAllBadgeCategories().length) {
            return false;
        }

        return true;
    }

    render() {
        return (
            <div id="badges-page">
                <div style={{marginBottom: "20px"}}>User can add and remove badges. User can only pick one badge for each category. Categories are "difficulty", "color" and "state"</div>
                <MutableContainer
                    isEditable={true}
                    initialItems={[]}
                    onChangeCallback={this.changeCallback}
                    elementGenerator={this.createBadge}
                    newElementDataProvider={function(): string {return "";}}
                    canHaveNewElementPredicate={this.canAddNewBadge}
                />
            </div>
        );
    };
};
export default BadgesPage;
