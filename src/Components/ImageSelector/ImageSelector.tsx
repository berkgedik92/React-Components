import React from 'react';
import './ImageSelector.css';

export type ImageSelectorProperties = {
    maxImageSizeInMb?: number;
    originalImage?: string;
    loadImageCallback?: any;
    editMode?: string;
    imageTooBigMessage: string;
    baseImageUrl: string;
    imageRemovedCallback?: any;
}

class ImageSelector extends React.Component<ImageSelectorProperties, any> {

    maxImageSizeInMb: number;
    originalImage: string;
    originalImageExists: boolean;
    originalImageRemoved: boolean;
    newImageExists: boolean;
    newImage: any;
    readerResult: any;
    newImageResizeRatio: number;
    canvas: any;
    loadImageCallback?: any;

    // Drag parameters
    initialDomLeft: any;
    initialDomTop: any;
    initialCursorX: any;
    initialCursorY: any;
    dragElement: any;
    minDomTop: any;
    maxDomTop: any;
    minDomLeft: any;
    maxDomLeft: any;
    initialDomWidth: any;
    initialDomHeight: any;
    selectedHolder: any;

    containerDom: any;
    editImageDom: any;
    displayImageDom: any;
    shadowDom: any;
    fileSelectorDom: any;
    shadowContainerRef: any;
    shadowInnerDomRef: any;
    topLeftHolderDomRef: any;
    topRightHolderDomRef: any;
    bottomLeftHolderDomRef: any;
    bottomRightHolderDomRef: any;

    visibilityMapForDomByState: any = {
        "EDIT_MODE,BACKGROUND_IMAGE": [
            "container", 
            "originalImage", 
            "buttonsContainer", 
            "removeButton"
        ],
        "EDIT_MODE,NO_IMAGE": [
            "container", 
            "fileSelector", 
            "loadImage"
        ],
        "EDIT_MODE,CANVAS_IMAGE_ADJUST": [
            "container", 
            "editImageContainer", 
            "editImage", 
            "pictureZoomContainer",
            "pictureZoomIn",
            "pictureZoomOut",
            "shadowContainer", 
            "shadow", 
            "buttonsContainer", 
            "removeButton", 
            "confirmButton"
        ],
        "EDIT_MODE,CANVAS_IMAGE_DISPLAY": [
            "container", 
            "displayImage", 
            "buttonsContainer", 
            "removeButton", 
            "editButton"
        ],
        "NO_EDIT_MODE,BACKGROUND_IMAGE": [
            "container", 
            "originalImage"
        ],
        "NO_EDIT_MODE,NO_IMAGE": [],
        "NO_EDIT_MODE,CANVAS_IMAGE_ADJUST": [],
        "NO_EDIT_MODE,CANVAS_IMAGE_DISPLAY": [
            "container", 
            "displayImage"
        ]
    };

    constructor(props: ImageSelectorProperties) {
        super(props);
        // Maximum image size
        this.maxImageSizeInMb = props.maxImageSizeInMb || 10;

        // Original Image
        this.originalImage = props.originalImage || "";
        this.originalImageExists = props.originalImage && props.originalImage.length > 0;
        this.originalImageRemoved = false;

        // New Image
        this.newImageExists = false;
        this.newImage = null;
        this.readerResult = null;
        this.newImageResizeRatio = 1;
        this.canvas = null;

        this.loadImageCallback = props.loadImageCallback;

        this.confirmButtonClicked = this.confirmButtonClicked.bind(this);
        this.editButtonClicked = this.editButtonClicked.bind(this);
        this.removeButtonClicked = this.removeButtonClicked.bind(this);
        this.shadowInnerMouseDown = this.shadowInnerMouseDown.bind(this);
        this.shadowInnerTouchStart = this.shadowInnerTouchStart.bind(this);
        this.topLeftHolderMouseDown = this.topLeftHolderMouseDown.bind(this);
        this.topLeftHolderTouchStart = this.topLeftHolderTouchStart.bind(this);
        this.topRightHolderMouseDown = this.topRightHolderMouseDown.bind(this);
        this.topRightHolderTouchStart = this.topRightHolderTouchStart.bind(this);
        this.bottomLeftHolderMouseDown = this.bottomLeftHolderMouseDown.bind(this);
        this.bottomLeftHolderTouchStart = this.bottomLeftHolderTouchStart.bind(this);
        this.bottomRightHolderMouseDown = this.bottomRightHolderMouseDown.bind(this);
        this.bottomRightHolderTouchStart = this.bottomRightHolderTouchStart.bind(this);
        this.shadowContainerMouseDown = this.shadowContainerMouseDown.bind(this);
        this.shadowContainerTouchStart = this.shadowContainerTouchStart.bind(this);
        this.fileSelectorChange = this.fileSelectorChange.bind(this);
        this.pictureZoomInClicked = this.pictureZoomInClicked.bind(this);
        this.pictureZoomOutClicked = this.pictureZoomOutClicked.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.containerDom = React.createRef();
        this.editImageDom = React.createRef();
        this.displayImageDom = React.createRef();
        this.shadowDom = React.createRef();
        this.fileSelectorDom = React.createRef();
        this.shadowContainerRef = React.createRef();
        this.shadowInnerDomRef = React.createRef();
        this.topLeftHolderDomRef = React.createRef();
        this.topRightHolderDomRef = React.createRef();
        this.bottomLeftHolderDomRef = React.createRef();
        this.bottomRightHolderDomRef = React.createRef();

        // Can be BACKGROUND_IMAGE (1), NO_IMAGE (2), CANVAS_IMAGE_ADJUST (3), CANVAS_IMAGE_DISPLAY (4)
        /* State changes can be: 
            
            1 -> 2
            2 -> 3
            3 -> 2, 4 
            4 -> 2, 3
        */
        this.state = {
            imageMode: this.originalImageExists ? "BACKGROUND_IMAGE" : "NO_IMAGE",
            editMode: props.editMode || "NO_EDIT_MODE"
        }

        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.drawEditImage();
        this.adjustShadowPosition();
        this.drawDisplayImage();
    }

    getVisibilityClass(element: string) {
        return this.visibilityMapForDomByState[this.state.editMode + "," + this.state.imageMode].indexOf(element) === -1 ? "invisible" : "visible";
    }

    updateState(editMode: string, imageMode: string) {
        let instance = this;
        this.setState(function(state: any, props: any) {
            return {
                "editMode": editMode,
                "imageMode": imageMode
            }
        }, function() {
            if (instance.state.imageMode === "NO_IMAGE") {
                instance.fileSelectorDom.current.value = "";
            }
            else if (instance.state.imageMode === "CANVAS_IMAGE_DISPLAY") {
                instance.drawDisplayImage();
            }
        });
    }

    startEdit() {
        this.updateState("EDIT_MODE", this.state.imageMode);
    }

    stopEdit() {
        this.updateState("NO_EDIT_MODE", this.state.imageMode);
    }

    drawEditImage() {
        if (this.readerResult) {
            const container: any = this.containerDom.current;
            let containerWidth: number = container.getBoundingClientRect().width;
            let containerHeight: number = container.getBoundingClientRect().height;

            if (this.newImage.width / 2 <= this.newImage.height) {
                this.newImageResizeRatio = containerWidth / this.newImage.width;
            }
            else {
                this.newImageResizeRatio = containerHeight / this.newImage.height;
            }

            this.editImageDom.current.style["width"] = this.newImage.width * this.newImageResizeRatio + "px";
            this.editImageDom.current.style["height"] = this.newImage.height * this.newImageResizeRatio + "px";
            this.editImageDom.current.src = this.readerResult;
        }
    }

    drawDisplayImage() {
        if (this.newImage) {
            this.canvas = document.createElement("canvas");
            let ctx = this.canvas.getContext("2d");

            const container = this.containerDom.current;
            this.displayImageDom.current.width = container.getBoundingClientRect().width;
            this.displayImageDom.current.height = container.getBoundingClientRect().height;

            const width = this.shadowDom.current.getBoundingClientRect().width / this.newImageResizeRatio;
            const height = this.shadowDom.current.getBoundingClientRect().height / this.newImageResizeRatio;
            const left = (parseInt(this.editImageDom.current.style["left"] || 0) * (-1) + parseInt(this.shadowDom.current.style["left"] || 0)) / this.newImageResizeRatio;
            const top = (parseInt(this.editImageDom.current.style["top"] || 0) * (-1) + parseInt(this.shadowDom.current.style["top"] || 0)) / this.newImageResizeRatio;

            this.canvas.width = width;
            this.canvas.height = height;
            ctx.drawImage(this.newImage, left, top, width, height, 0, 0, width, height);
            this.displayImageDom.current.src = this.canvas.toDataURL();
        }
    }

    adjustShadowPosition() {
        if (!this.shadowDom.current) {
            return;
        }
        let left = parseInt(this.shadowDom.current.style["left"] || 0);
        let top = parseInt(this.shadowDom.current.style["top"] || 0);
        let maxDomTop = this.containerDom.current.getBoundingClientRect().height - this.shadowDom.current.getBoundingClientRect().height;
        let maxDomLeft = this.containerDom.current.getBoundingClientRect().width - this.shadowDom.current.getBoundingClientRect().width;

        if (left > maxDomLeft) {
            this.shadowDom.current.style["left"] = maxDomLeft + "px";
        }

        if (top > maxDomTop) {
            this.shadowDom.current.style["top"] = maxDomTop + "px";
        }
    }

    // Dragging code
    dragMouseUp() {
        document.onmouseup = null;
        document.onmousemove = null;
    };

    dragTouchEnd() {
        document.ontouchmove = null;
        document.ontouchend = null;
    }

    dragMove(x: number, y: number) {
        let changeX = x - this.initialCursorX;
        let changeY = y - this.initialCursorY;
        let newBackX = this.initialDomLeft + changeX;
        let newBackY = this.initialDomTop + changeY;

        if (newBackX < this.minDomLeft) {
            newBackX = this.minDomLeft;
        }
        if (newBackX > this.maxDomLeft) {
            newBackX = this.maxDomLeft;
        }
        if (newBackY < this.minDomTop) {
            newBackY = this.minDomTop;
        }
        if (newBackY > this.maxDomTop) {
            newBackY = this.maxDomTop;
        }

        this.dragElement.style["top"] = newBackY + "px";
        this.dragElement.style["left"] = newBackX + "px";
    }

    dragTouchMove(el: any, event: any) {
        let touch = event.touches[0] || event.changedTouches[0];
        let x = touch.pageX;
        let y = touch.pageY;
        this.dragMove(x, y);
    }

    dragMouseMove(el: any, event: any) {
        let x = event.clientX;
        let y = event.clientY;
        el.dragMove(x, y);
        event.stopPropagation();
    };

    shadowDomDragStart() {
        this.dragElement = this.shadowDom.current;
        this.initialDomLeft = parseInt(this.dragElement.style["left"] || 0);
        this.initialDomTop = parseInt(this.dragElement.style["top"] || 0);
        this.minDomTop = 0;
        this.minDomLeft = 0;
        this.initialDomWidth = this.dragElement.getBoundingClientRect().width
        this.initialDomHeight = this.dragElement.getBoundingClientRect().height;
        this.maxDomTop = this.containerDom.current.getBoundingClientRect().height - this.initialDomHeight;
        this.maxDomLeft = this.containerDom.current.getBoundingClientRect().width - this.initialDomWidth;
    }

    shadowInnerMouseDown(event: any) {
        this.shadowDomDragStart();
        document.onmouseup = this.dragMouseUp;
        document.onmousemove = (event: any) => {
            this.dragMouseMove(this, event);
        };
        this.initialCursorX = event.clientX;
        this.initialCursorY = event.clientY;
        event.stopPropagation();
    }

    shadowInnerTouchStart(event: any) {
        this.shadowDomDragStart();
        document.ontouchend = this.dragTouchEnd;
        document.ontouchmove = (event: any) => {
            this.dragTouchMove(this, event);
        }
        let touch = event.touches[0] || event.changedTouches[0];
        this.initialCursorX = touch.pageX;
        this.initialCursorY = touch.pageY;
        event.preventDefault();
        event.stopPropagation();
    }

    // Shadow resize code
    resizeMove(x: number, y: number) {
        let assumedChangeX = x - this.initialCursorX;
        let assumedChangeY = assumedChangeX / 2;

        if (this.selectedHolder === "top-right") {
            this.dragElement.style["width"] = (this.initialDomWidth + assumedChangeX) + "px";
            this.dragElement.style["height"] = (this.initialDomHeight + assumedChangeY) + "px";
            this.dragElement.style["top"] = (this.initialDomTop - assumedChangeY) + "px";
        }
        else if (this.selectedHolder === "top-left") {
            this.dragElement.style["width"] = (this.initialDomWidth - assumedChangeX) + "px";
            this.dragElement.style["height"] = (this.initialDomHeight - assumedChangeY) + "px";
            this.dragElement.style["left"] = (this.initialDomLeft + assumedChangeX) + "px";
            this.dragElement.style["top"] = (this.initialDomTop + assumedChangeY) + "px";
        }
        else if (this.selectedHolder === "bottom-right") {
            this.dragElement.style["width"] = (this.initialDomWidth + assumedChangeX) + "px";
            this.dragElement.style["height"] = (this.initialDomHeight + assumedChangeY) + "px";
        }
        else if (this.selectedHolder === "bottom-left") {
            this.dragElement.style["width"] = (this.initialDomWidth - assumedChangeX) + "px";
            this.dragElement.style["height"] = (this.initialDomHeight - assumedChangeY) + "px";
            this.dragElement.style["left"] = (this.initialDomLeft + assumedChangeX) + "px";
        }
    }

    resizeTouchMove(el: any, event: any) {
        let touch = event.touches[0] || event.changedTouches[0];
        let x = touch.pageX;
        let y = touch.pageY;
        el.resizeMove(x, y);
    }

    resizeMouseMove(el: any, event: any) {
        let x = event.clientX;
        let y = event.clientY;
        el.resizeMove(x, y);
    };

    // topLeftHolderDom

    shadowDomMouseDown(event: any) {
        this.shadowDomDragStart();
        this.initialCursorX = event.clientX;
        this.initialCursorY = event.clientY;
        document.onmouseup = this.dragMouseUp;
        document.onmousemove = (event: any) => {
            this.resizeMouseMove(this, event);
        };
        event.stopPropagation();
    }

    shadowDomTouchStart(event: any) {
        this.shadowDomDragStart();
        let touch = event.touches[0] || event.changedTouches[0];
        this.initialCursorX = touch.pageX;
        this.initialCursorY = touch.pageY;
        document.ontouchend = this.dragTouchEnd;
        document.ontouchmove = (event: any) => {
            this.resizeTouchMove(this, event);
        };
        event.preventDefault();
    }

    topLeftHolderMouseDown(event: any) {
        this.selectedHolder = "top-left";
        this.shadowDomMouseDown(event);
        event.stopPropagation();
    }

    topLeftHolderTouchStart(event: any) {
        this.selectedHolder = "top-left";
        this.shadowDomTouchStart(event);
        event.preventDefault();
        event.stopPropagation();
    }

    topRightHolderMouseDown(event: any) {
        this.selectedHolder = "top-right";
        this.shadowDomMouseDown(event);        
        event.stopPropagation();
    }

    topRightHolderTouchStart(event: any) {
        this.selectedHolder = "top-right";
        this.shadowDomTouchStart(event);
        event.preventDefault();
    }

    bottomLeftHolderMouseDown(event: any) {
        this.selectedHolder = "bottom-left";
        this.shadowDomMouseDown(event);             
        event.stopPropagation();

    }

    bottomLeftHolderTouchStart(event: any) {
        this.selectedHolder = "bottom-left";
        this.shadowDomTouchStart(event);        
        event.preventDefault();
        event.stopPropagation();
    }

    bottomRightHolderMouseDown(event: any) {
        this.selectedHolder = "bottom-right";
        this.shadowDomMouseDown(event);              
        event.stopPropagation();
    }

    bottomRightHolderTouchStart(event: any) {
        this.selectedHolder = "bottom-right";
        this.shadowDomTouchStart(event);        
        event.preventDefault();        
        event.stopPropagation();
    }

    // Image move code
    shadowContainerDomDragStart() {
        this.dragElement = this.editImageDom.current;
        this.initialDomLeft = parseInt(this.dragElement.style["left"] || 0);
        this.initialDomTop = parseInt(this.dragElement.style["top"] || 0);
        this.minDomTop =  this.containerDom.current.getBoundingClientRect().height - this.dragElement.getBoundingClientRect().height;
        this.minDomLeft = this.containerDom.current.getBoundingClientRect().width - this.dragElement.getBoundingClientRect().width;
        this.maxDomTop = 0;
        this.maxDomLeft = 0;
    }

    shadowContainerMouseDown(event: any) {
        this.shadowContainerDomDragStart();
        this.initialCursorX = event.clientX;
        this.initialCursorY = event.clientY;
        document.onmouseup = this.dragMouseUp;
        document.onmousemove = (event: any) => {
            this.dragMouseMove(this, event);
        };
    }

    shadowContainerTouchStart(event: any) {
        this.shadowContainerDomDragStart();
        let touch = event.touches[0] || event.changedTouches[0];
        this.initialCursorX = touch.pageX;
        this.initialCursorY = touch.pageY;
        document.ontouchend = this.dragTouchEnd;
        document.ontouchmove = (event: any) => {
            return this.dragTouchMove(this, event);
        }
        event.preventDefault();
        event.stopPropagation();
    }
    // Dragging code ended

    // Event listeners for buttons and inputs
    fileSelectorChange() {
        let pictureData = this.fileSelectorDom.current.files[0];

        if (!pictureData) {
            return;
        }
 
        if (pictureData.size > this.maxImageSizeInMb * 1000000) {
            alert(this.props.imageTooBigMessage + this.maxImageSizeInMb + " MB");
            this.fileSelectorDom.current.value = "";
            return;
        };

        let reader = new FileReader();
        let instance = this;
        reader.onloadend = function(e: any) {
            const img = new Image();
            img.onload = () => {
                instance.newImage = img;
                instance.newImageExists = true;
                instance.drawEditImage();
                instance.updateState("EDIT_MODE", "CANVAS_IMAGE_ADJUST");
                if (instance.loadImageCallback) {
                    instance.loadImageCallback();
                }
            };

            instance.readerResult = reader.result;
            img.src = reader.result + "";
        };

        reader.readAsDataURL(pictureData);
    }

    removeButtonClicked() {
        // If we removed the original image, note it and remove background image
        if (this.originalImageExists) {
            this.originalImageExists = false;
            this.originalImageRemoved = true;
        }
        this.newImageExists = false;
        this.updateState("EDIT_MODE", "NO_IMAGE");
        if (this.props.imageRemovedCallback) {
            this.props.imageRemovedCallback();
        }
    }

    confirmButtonClicked() {
        this.updateState("EDIT_MODE", "CANVAS_IMAGE_DISPLAY");
    };

    editButtonClicked() {
        this.updateState("EDIT_MODE", "CANVAS_IMAGE_ADJUST");
    };

    pictureZoomInClicked() {
        this.newImageResizeRatio *= 1.05;
        this.refreshEditImageDom();
    }

    pictureZoomOutClicked() {
        this.newImageResizeRatio *= 0.95;
        this.refreshEditImageDom();
    }

    refreshEditImageDom () {
        this.editImageDom.current.style["width"] = this.newImage.width * this.newImageResizeRatio + "px";
        this.editImageDom.current.style["height"] = this.newImage.height * this.newImageResizeRatio + "px";
        this.editImageDom.current.src = this.readerResult;
    }

    // Methods to be called from outside of the component
    getNewImageBlob(): Blob {
        if (this.state.imageMode === "BACKGROUND_IMAGE" || this.state.imageMode === "NO_IMAGE") {
            return null;
        }

        if (this.state.imageMode === "CANVAS_IMAGE_ADJUST") {
            this.updateState("EDIT_MODE", "CANVAS_IMAGE_DISPLAY");
        }

        let dataURI = this.canvas.toDataURL('image/jpeg', 1.0);

        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type: mimeString});
    }

    isOriginalImageExisting(): boolean {
        return this.originalImageExists;
    }

    isNewImageExisting(): boolean {
        return this.newImageExists;
    }

    componentDidMount() {
        this.shadowInnerDomRef.current.addEventListener('touchstart', this.shadowInnerTouchStart, { passive: false});
        this.topLeftHolderDomRef.current.addEventListener('touchstart', this.topLeftHolderTouchStart, { passive: false });
        this.topRightHolderDomRef.current.addEventListener('touchstart', this.topRightHolderTouchStart, { passive: false });
        this.bottomLeftHolderDomRef.current.addEventListener('touchstart', this.bottomLeftHolderTouchStart, { passive: false });
        this.bottomRightHolderDomRef.current.addEventListener('touchstart', this.bottomRightHolderTouchStart, { passive: false });
        this.shadowContainerRef.current.addEventListener('touchstart', this.shadowContainerTouchStart, { passive: false});
    }

    render() {
        return (
            <div className={"image-container " + this.getVisibilityClass("container")} style={this.state.editMode === "NO_EDIT_MODE" && this.state.imageMode === "NO_IMAGE" ? {"display": "none"} : {"display": "inline-flex"}} ref={this.containerDom}>
                <div className={"original-image " + this.getVisibilityClass("originalImage")} style={this.originalImageExists && this.state.imageMode !== "NO_IMAGE" ? {"backgroundImage": "url('" + this.originalImage + "')"} : {"backgroundImage": ""}}></div>
                <div className={"edit-image-container " + this.getVisibilityClass("editImageContainer")}>
                    <img alt="" className={"edit-image " + this.getVisibilityClass("editImage")} style={this.state.imageMode === "NO_IMAGE" ? {"left": 0 ,"top": 0} : {}} ref={this.editImageDom}/>
                </div>
                <img alt="" className={"display-image " + this.getVisibilityClass("displayImage")} ref={this.displayImageDom}/>
                <div className={"picture-zoom-container " + this.getVisibilityClass("pictureZoomContainer")}>
                    <div className={"picture-zoom-in " + this.getVisibilityClass("pictureZoomIn")} onClick={this.pictureZoomInClicked}>
                        <img alt="" src={this.props.baseImageUrl + "zoomin.svg"} width="16" height="16"/>
                    </div>
                    <div className={"picture-zoom-out " + this.getVisibilityClass("pictureZoomOut")} onClick={this.pictureZoomOutClicked}>
                        <img alt="" src={this.props.baseImageUrl + "zoomout.svg"} width="16" height="16"/>
                    </div>
                </div>
                <input className={"file-selector " + this.getVisibilityClass("fileSelector")} type="file" accept="image/*" ref={this.fileSelectorDom} onChange={this.fileSelectorChange}/>
                <div className={"load-image-icon " + this.getVisibilityClass("loadImage")}></div>
                <div className={"shadow-container " + this.getVisibilityClass("shadowContainer")} onMouseDown={this.shadowContainerMouseDown} ref={this.shadowContainerRef}>
                    <div className={"shadow " + this.getVisibilityClass("shadow")} ref={this.shadowDom}>
                        <div ref={this.shadowInnerDomRef} className={"shadow-inner-dom"} onMouseDown={this.shadowInnerMouseDown}></div>
                        <div ref={this.topLeftHolderDomRef} className={"top-left-holder holder"} onMouseDown={this.topLeftHolderMouseDown}></div>
                        <div ref={this.topRightHolderDomRef} className={"top-right-holder holder"} onMouseDown={this.topRightHolderMouseDown}></div>
                        <div ref={this.bottomLeftHolderDomRef} className={"bottom-left-holder holder"} onMouseDown={this.bottomLeftHolderMouseDown}></div>
                        <div ref={this.bottomRightHolderDomRef} className={"bottom-right-holder holder"} onMouseDown={this.bottomRightHolderMouseDown}></div>
                    </div>
                </div>
                <div className={"buttons-container " + this.getVisibilityClass("buttonsContainer")}>
                    <div className={"display-image-icon button " + this.getVisibilityClass("confirmButton")} onClick={this.confirmButtonClicked}>
                        <img alt="" src={this.props.baseImageUrl + "confirm.svg"} width="30" height="30"/>
                    </div>
                    <div className={"edit-image-icon button " + this.getVisibilityClass("editButton")} onClick={this.editButtonClicked}>
                        <img alt="" src={this.props.baseImageUrl + "edit-image.svg"} width="20" height="20"/>
                    </div>
                    <div className={"remove-image-icon button " + this.getVisibilityClass("removeButton")} onClick={this.removeButtonClicked}>
                        
                    </div>
                </div>
            </div>
        );
    };
};
export default ImageSelector;
