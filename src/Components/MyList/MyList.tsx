import React from 'react';
import './MyList.css';

export type MyListProperties = {
    onChangeCallback?: any; // method
    minimumLetterForSuggestion?: number;
    regularList?: boolean;
    textAdjuster?: any; // method
    placeholder?: string;
    isEditable?: boolean;
    freeTextAllowed?: boolean;
    shouldDisplayElementPredicate?: any;
    showIcons?: boolean;
    data: any[];
    initialValueId?: string;
}

class MyList extends React.Component<MyListProperties, any> {

    onChangeCallback: any; // method
    minimumLetterForSuggestion: number;
    regularList: boolean;
    textAdjuster: any; // method
    placeholder: string;
    freeTextAllowed: boolean;
    shouldDisplayElementPredicate: any;
    showIcons: boolean;
    data: any[];
    keys: any;
    allowedNames: string[];
    dataByKey: any;
    dataByText: any;
    selectedElementRef: any;
    containerRef: any;
    uniqueListId: string;

    isListOpened: boolean = false;
    grayImage: string = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

    constructor(props: MyListProperties) {
        super(props);
        this.onChangeCallback = props.onChangeCallback || function() {};
        this.minimumLetterForSuggestion = props.minimumLetterForSuggestion || 0;
        this.regularList = props.regularList || false;
        this.textAdjuster = props.textAdjuster || function(text: string) {return text;};
        this.placeholder = props.placeholder || "";
        this.freeTextAllowed = props.freeTextAllowed || false;
        this.shouldDisplayElementPredicate = props.shouldDisplayElementPredicate || function(element: any) {return true;}
        this.showIcons = props.showIcons || false;

        let num1: number = Date.now();
        let num2: number = Math.random() * 10000 + 10000;

        this.uniqueListId = num1.toString() + num2.toString().substr(0, 5);

        this.selectedElementRef = React.createRef();
        this.containerRef = React.createRef();

        if (this.showIcons) {
            this.data = props.data;
        }
        else {
            this.data = [];
            for (let i = 0; i < props.data.length; i++) {
                this.data.push({
                    "id": props.data[i].id,
                    "text": props.data[i].text,
                    "icon": ""
                });
            }
        }

        this.keys = this.data.map(element => element.id);
        this.allowedNames = this.data.map(element => element.text.toLowerCase());

        this.dataByKey = {};
        this.dataByText = {};

        for (let i = 0; i < this.data.length; i++) {
            this.dataByKey[this.data[i].id.toLowerCase()] = this.data[i];
            this.dataByText[this.data[i].text.toLowerCase()] = this.data[i];
        }

        let selectedText = "";
        let selectedIcon = "";

        if (props.initialValueId) {
            let initialData = this.dataByKey[props.initialValueId.toLowerCase()];
            let text = initialData ? initialData.text : props.initialValueId;
            let icon = initialData ? initialData.icon : "";
            selectedText = text;
            
            if (icon && icon.length > 0) {
                selectedIcon = icon;
            }
            else {
                selectedIcon = this.grayImage;
            }
        }

        this.state = {
            isEditable: props.isEditable || false,
            listOpened: false,
            selectedText: selectedText,
            selectedIcon: selectedIcon
        };

        this.elementClicked = this.elementClicked.bind(this);
        this.selectedElementClicked = this.selectedElementClicked.bind(this);
        this.handleKeyUpChange = this.handleKeyUpChange.bind(this);
        this.windowClickHandler = this.windowClickHandler.bind(this);
        window.addEventListener('click', this.windowClickHandler);
    }

    componentDidMount() {
        this.containerRef.current.setAttribute("my-unique-list-id", this.uniqueListId);
    }

    windowClickHandler(event: any) {
        let maybeId: string = this.findUniqueListId(event.srcElement);
        if (this.state.listOpened && (!maybeId || maybeId !== this.uniqueListId)) {
            this.closeList();
        }
    }

    findUniqueListId(node: any): string {
        if (!node) {
            return "";
        }
        let maybeId: string = node.getAttribute("my-unique-list-id");
        if (maybeId) {
            return maybeId;
        }
        return this.findUniqueListId(node.parentElement);
    }

    disable() {
        if (this.isListOpened) {
            this.closeList();
        }
        this.setState(function(state: any, props: any) {
            return {
                isEditable: false
            }
        });
    }

    closeList() {
        this.setState(function(state: any, props: any) {
            return {
                listOpened: false
            }
        });
    }

    shouldElementFiltered(element: any): boolean {
        let currentValue = this.state.selectedText.toLowerCase();
        let elementId = element.id;
        let nameValue = element.text.toLowerCase();

        if (!this.regularList && (nameValue.indexOf(currentValue) === -1 || !this.shouldDisplayElementPredicate(nameValue, elementId))) {
            return true;
        }
        else {
            return false;
        }
    }

    openList() {
        this.setState(function(state: any, props: any) {
            return {
                listOpened: true
            }
        });
    }

    elementClicked(element: any) {
        let instance = this;
        this.setState(function(state: any, props: any) {
            return {
                listOpened: false,
                selectedText: element.text,
                selectedIcon: element.icon
            }
        }, function() {
            instance.onChangeCallback();
        });
    }

    selectedElementClicked() {
        if (!this.state.isEditable) {
            return;
        }

        if (!this.state.listOpened && this.state.selectedText.length >= this.minimumLetterForSuggestion) {
            this.openList();
        }
        else {
            this.closeList();
        }
    }

    handleKeyUpChange = (event: any) => {
        let instance = this;
        let currentValue = this.textAdjuster(event.target.value).toLowerCase();
        let icon = this.grayImage;

        if (this.allowedNames.indexOf(currentValue) !== -1) {
            let data: any = this.dataByText[currentValue] || {};
            if (data.icon && data.icon.length > 0) {
                icon = data.icon;
            }
        }

        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === '13') {
            this.setState(function(state: any, props: any) {
                return {
                    selectedText: this.textAdjuster(event.target.value),
                    selectedIcon: icon,
                    listOpened: false
                }
            }, function() {
                instance.onChangeCallback();
            });
        }
        else {
            this.setState(function(state: any, props: any) {
                return {
                    selectedText: this.textAdjuster(event.target.value),
                    selectedIcon: icon,
                    listOpened: currentValue.length >= this.minimumLetterForSuggestion
                }
            }, function() {
                instance.onChangeCallback();
            });
        }
    }

    enable() {
        this.setState(function(state: any, props: any) {
            return {
                isEditable: true
            }
        });
    }

    getValue(): string {
        let text = this.state.selectedText.trim();
        let index = this.allowedNames.indexOf(text.toLowerCase());
        if (this.freeTextAllowed) {
            if (index === -1) {
                return text;
            }
            else {
                return this.keys[index];
            }
        }
        else {
            if (index === -1) {
                return "";
            }
            else {
                return this.keys[index];
            }
        }
    }

    setBorderColor(color: string) {
        this.selectedElementRef.current.style["border"] = "2px solid " + color;
    }

    render() {
        let elements: any[] = [];
        let visibleElementCounter: number = 0;

        for (let i = 0; i < this.data.length; i++) {
            if (this.shouldElementFiltered(this.data[i])) {
                continue;
            }
            visibleElementCounter++;

            if (this.data[i].icon && this.data[i].icon.length > 0) {
                elements.push(
                    <div key={i} className="element" onClick={() => this.elementClicked(this.data[i])}>
                        <img alt="" className="element-icon" src={this.data[i].icon} style={this.showIcons ? {} : {"display": "none"}}/>
                        <div className="element-name">{this.data[i].text}</div>
                    </div>
                );
            }
            else {
                elements.push(
                    <div key={i} className="element" onClick={() => this.elementClicked(this.data[i])}>
                        <img alt="" className="element-icon" src={this.grayImage} style={this.showIcons ? {} : {"display": "none"}}/>
                        <div className="element-name">{this.data[i].text}</div>
                    </div>
                );
            }
        }

        let inputStyle: any = {};
        if (!this.freeTextAllowed) {
            if (this.allowedNames.indexOf(this.state.selectedText.toLowerCase()) === -1) {
                inputStyle["color"] = "gray";
            }
            else {
                inputStyle["color"] = "unset";
            }
        }

        if (!this.showIcons) {
            inputStyle["width"] = "100%";
        }

        let elementIcon = (this.state.selectedIcon && this.state.selectedIcon.length > 0) ?
            (<img alt="" className="element-icon" src={this.state.selectedIcon} style={this.showIcons ? {} : {"display": "none"}}/>) :
            (<img alt="" className="element-icon" src={this.grayImage} style={this.showIcons ? {} : {"display": "none"}}/>);


        let elementInput = this.regularList ? 
            (
                <div className="selected-element" style={{"cursor": this.state.isEditable ? "pointer" : "default"}} onClick={this.selectedElementClicked}>
                    {elementIcon}
                    <div className="element-input" style={inputStyle}>{this.state.selectedText}</div>
                </div>
            ) : 
            (                                  
                <div className="selected-element" onClick={this.selectedElementClicked} ref={this.selectedElementRef}>
                    {elementIcon}
                    <input 
                        style={inputStyle}
                        disabled={(!this.state.isEditable) ? true : false} 
                        value={this.state.selectedText} 
                        className="element-input" 
                        placeholder={this.placeholder} 
                        autoComplete="off"
                        onChange={this.handleKeyUpChange}
                    />
                </div>
            );

        return (
            <div className={this.state.isEditable ? "my-list-component enabled" : "my-list-component disabled"} ref={this.containerRef}>
                {elementInput}
                <div className="my-elements-list" style={this.state.listOpened && visibleElementCounter > 0 ? {"display": "block"} : {"display": "none"}}>
                    {elements}
                </div>
            </div>
        );
    };
};
export default MyList;
