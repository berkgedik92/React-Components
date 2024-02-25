import React from 'react';
import './Homepage.css';
import {Link} from "react-router-dom";

class Homepage extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div id="homepage">
                <div>Welcome to my React component portfolio! You can use the links below to visit any component you want to check</div>
                <ul>
                    <li><Link to="/badges">Badges Component</Link></li>
                    <li><Link to="/rating">Ratings Component</Link></li>
                    <li><Link to="/image_selector">Image Selector Component</Link></li>
                    <li><Link to="/card_game">Card Game Component</Link></li>
                </ul>
            </div>
        );
    };
};
export default Homepage;
