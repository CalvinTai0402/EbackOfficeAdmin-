import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from '../components/Sidebar'
import 'semantic-ui-css/semantic.min.css'
import '../../css/App.css';
class App extends React.Component {

    componentDidMount() {
        window.parent.document.body.style.zoom = 0.75;
    }

    render() {
        return (
            <div>
                <Sidebar />
            </div >
        );
    }

}

export default App;

if (document.getElementById('root')) {
    ReactDOM.render(<App />, document.getElementById('root'));
}
