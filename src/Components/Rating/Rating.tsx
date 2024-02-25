import React from 'react';
import './Rating.css';

export type RatingProperties = {
    rating: number;
    count: number;
    identifier: string;
    ratingClickCallback?: any;
};

class Rating extends React.Component<RatingProperties, any> {

    rating: number;

    constructor(props: RatingProperties) {
        super(props);
        this.state = {
            "selectedStars": this.props.rating
        };
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    computeOffsets(rating: number): string[] {
        let offsets: string[] = ["0", "0", "0", "0", "0"];
        for (let i = 4; i >= 0; i--) {
            let starPoint = Math.min(1, Math.max(0, rating - i));
            offsets[i] = (starPoint * 100) + "%";
        }
        return offsets;
    }

    handleMouseOver(index: number) {
        this.setState(function(state: any, props: any) {
            return {
                selectedStars: index + 1
            }
        });
    }

    handleMouseOut() {
        this.setState(function(state: any, props: any) {
            return {
                selectedStars: this.props.rating
            }
        });
    }

    ratingClickCallback(rating: number) {
        if (this.props.ratingClickCallback) {
            this.props.ratingClickCallback(this.props.identifier, rating);
        }
    }

    render() {
        let offsets: string[] = this.computeOffsets(this.state.selectedStars);

        let stars: any[] = [];
        for (let i = 0; i < 5; i++) {
            let el = (
                <div 
                    key={i}
                    className="star-div" 
                    onMouseOver={() => this.handleMouseOver(i)} 
                    onMouseOut={() => this.handleMouseOut()} 
                    onClick={() => this.ratingClickCallback(i + 1)}>
                    <svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <linearGradient id={this.props.identifier + "-star-" + i} x1="0" x2="100%" y1="0" y2="0">
                            <stop offset={offsets[i]} stopColor="#9C1F1E"></stop>
                            <stop offset="0" stopOpacity="0"></stop>
                        </linearGradient>
                        <use href="#star-body" fill={"url('#" + this.props.identifier + "-star-" + i + "')"}></use>
                        <use href="#star-outline" fill="#9C1F1E"></use>
                    </svg>
                </div>
            );
            stars.push(el);
        }

        return (
            <div className="five-star-rating">
                <svg style={{"display": "none"}}>
                    <defs>
                        <path id="star-outline" d="M19.1139718,23.7837042 C18.8750743,23.9209492 18.6074766,23.9870625 18.3306016,23.9870625 C17.9991016,23.9870625 17.6801172,23.8914844 17.4643985,23.7310781 L17.4643985,23.7310781 L11.9999922,20.203125 L6.56999223,23.7078281 C6.01161723,24.0974062 5.32536723,24.0974062 4.76699223,23.7078281 L4.803,23.731 L4.792,23.724 L4.787,23.72 L4.70308708,23.6641796 C4.25873309,23.3379793 4.03332071,22.8306275 4.07839248,22.2611407 L4.09742973,22.104375 L5.34374223,15.703125 L0.463632855,10.8645938 C0.0157891051,10.4128125 -0.10735152,9.79026562 0.0930859801,9.19260937 C0.105507855,9.15548438 0.119851605,9.1190625 0.13602348,9.0834375 C0.403726605,8.49384375 0.95042973,8.15625 1.59772661,8.15625 L1.59772661,8.15625 L7.73436723,8.15625 C7.73436723,8.15625 8.39690813,6.45665898 9.07597855,4.7147222 L9.27954955,4.19252804 C9.92166995,2.54538623 10.5204057,1.00959375 10.5218829,1.00603125 C10.7771641,0.3885 11.3267266,0 11.9992422,0 C12.6708204,0 13.2189297,0.385828125 13.4882735,1.02923437 L13.4882735,1.02923437 L16.2656172,8.13871875 L22.4007579,8.13871875 C23.0470235,8.13871875 23.592086,8.49126563 23.8623204,9.07776562 C23.8803204,9.11709375 23.896211,9.15735937 23.909711,9.19846875 C24.1067266,9.7965 23.9815235,10.4180156 23.5311485,10.86825 L23.5311485,10.86825 L18.7031172,15.65625 C18.7031172,15.65625 19.9039141,22.1200781 19.9052735,22.1277656 C20.0161797,22.7852344 19.7434141,23.4020156 19.1699922,23.7485625 L19.253711,23.6927813 L19.253711,23.6927813 L19.1699922,23.7485625 L19.23,23.707 Z M11.9943051,1.62711864 C11.668678,2.4620339 9.26994915,8.61559322 9.24411864,8.68174576 L9.24411864,8.68174576 L8.84018644,9.71786441 L1.6779661,9.71786441 L7.10084746,15.094678 L5.70594915,22.2594407 L11.9938475,18.2009492 L18.2807797,22.2598983 C18.1308814,21.4527966 17.1081864,15.9475932 17.0971017,15.8879492 L17.0971017,15.8879492 L16.9398814,15.0415932 L22.3257966,9.70032203 L15.1481186,9.70032203 Z"></path>
                        <path id="star-body" d="M23.909711,9.19846875 C23.896211,9.15735938 23.8803204,9.11709375 23.8623204,9.07776563 C23.592086,8.49126563 23.0470235,8.13871875 22.4007579,8.13871875 L16.2656172,8.13871875 L13.4882735,1.02923437 C13.2189297,0.385828125 12.6708204,0 11.9992422,0 C11.3267266,0 10.7771641,0.3885 10.5218829,1.00603125 C10.5186954,1.01371875 7.73436723,8.15625 7.73436723,8.15625 L1.59772661,8.15625 C0.95042973,8.15625 0.403726605,8.49384375 0.13602348,9.0834375 C0.119851605,9.1190625 0.105507855,9.15548438 0.0930859801,9.19260937 C-0.10735152,9.79026563 0.0157891051,10.4128125 0.463632855,10.8645938 L5.34374223,15.703125 L4.09742973,22.104375 C3.98553911,22.7895938 4.25797661,23.4031406 4.82966411,23.7485625 L4.76699223,23.7078281 C5.32536723,24.0974063 6.01161723,24.0974063 6.56999223,23.7078281 L11.9999922,20.203125 L17.4643985,23.7310781 C17.6801172,23.8914844 17.9991016,23.9870625 18.3306016,23.9870625 C18.6628516,23.9870625 18.9817422,23.8918594 19.253711,23.6927813 L19.1699922,23.7485625 C19.7434141,23.4020156 20.0161797,22.7852344 19.9052735,22.1277656 C19.9039141,22.1200781 18.7031172,15.65625 18.7031172,15.65625 L23.5311485,10.86825 C23.9815235,10.4180156 24.1067266,9.7965 23.909711,9.19846875 Z"></path>
                    </defs>
                </svg>
                {stars}
                <span>{"(votes: " + this.props.count + ") (average rating: " + Math.round((this.props.rating + Number.EPSILON) * 100) / 100 + ")"}</span>
            </div>
        );
    }
};
export default Rating;
