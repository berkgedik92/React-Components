import React from 'react';
import './RatingPage.css';
import Rating from './Rating'

class RatingPage extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            "rating": 4,
            "count": 2
        };
        this.ratingClickCallback = this.ratingClickCallback.bind(this);
    }

    ratingClickCallback(identifier: string, rating: number) {
        alert("Given " + rating + " stars as rating");
        this.setState(function(state: any, props: any) {
            return {
              rating: (state.rating * state.count + rating) / (state.count + 1),
              count: state.count + 1
            }
        });
    }

    render() {
        return (
            <div id="rating-page">
                <div style={{marginBottom: "20px"}}>This component shows the number of votes and the average rating. User can give a vote by hovering to one of the stars and click it.</div>
                <Rating
                    count={this.state.count}
                    rating={this.state.rating}
                    identifier="unique-id"
                    ratingClickCallback={this.ratingClickCallback}
                />
            </div>
        );
    };
};
export default RatingPage;
