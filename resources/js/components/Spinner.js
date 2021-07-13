import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

class Spinner extends React.Component {
    render() {
        return (
            <Dimmer active>
                <Loader size="huge" content={this.props.text || "Deleting..."} />
            </Dimmer>
        )
    }
};

export default Spinner;
