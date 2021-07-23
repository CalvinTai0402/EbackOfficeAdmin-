import React, { Component } from 'react';

class FileManager extends Component {

    componentDidMount() {
        const script = document.createElement("script");
        script.src = "vendor/file-manager/js/file-manager.js";
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <React.Fragment>
                <div style={{ height: "800px" }} className="centerVaH" >
                    <div id="fm"></div>
                </div>
            </React.Fragment >
        )
    }
}

export default FileManager;