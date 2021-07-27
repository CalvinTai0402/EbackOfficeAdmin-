import React, { Component } from 'react';
import '../../css/App.css';

class Home extends Component {

    render() {
        return (
            <div className='homeImage'>
                <img style={{
                    // height: "400px",
                    // width: "800px"
                }} src={"/home/home1.jpeg"} alt={"Homepage image"} />
            </div>
        );
    }
}

export default Home;