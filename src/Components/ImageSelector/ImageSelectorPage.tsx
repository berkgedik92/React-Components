import React from 'react';
import './ImageSelectorPage.css';
import ImageSelector from './ImageSelector'


class ImageSelectorPage extends React.Component<any, any> {


    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div id="image-selectior-page">
                <div style={{marginBottom: "20px"}}>This component allows user to load an image and then perform crop operation and zoom in/out.</div>
                <ImageSelector
                    originalImage=""
                    editMode="EDIT_MODE"
                    maxImageSizeInMb={5}
                    imageTooBigMessage="Image size cannot exceed 5MB"
                    baseImageUrl="http://localhost:3000/"
                />  
            </div>
        );
    };
};
export default ImageSelectorPage;
