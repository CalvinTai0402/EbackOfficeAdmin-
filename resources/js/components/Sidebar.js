import React from "react";
import '../../css/App.css';
import { ProSidebar, Menu, MenuItem, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { FaBattleNet } from "react-icons/fa";
import Home from "./Home"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import CustomerIndex from './Customer/CustomerIndex';
import CustomerCreate from './Customer/CustomerCreate';
import CustomerEdit from "./Customer/CustomerEdit";

class Sidebar extends React.Component {
    state = {
        menuCollapse: false,
        loggedInUserName: "Guest",
    };

    async componentDidMount() {
        const res = await axios.get("/getLoggedInUsername")
        console.log(res)
        this.setState({ loggedInUserName: res.data.loggedInUserName })
    }

    menuIconClick = async () => {
        const res = await axios.get("/getLoggedInUsername")
        console.log(res)
        const { menuCollapse } = this.state;
        menuCollapse ? this.setState({ menuCollapse: false }) : this.setState({ menuCollapse: true })
    };


    render() {

        const { menuCollapse, loggedInUserName } = this.state;
        return (
            <div >
                <Router>
                    <div id="sidebar" style={{ display: 'grid', gridTemplateColumns: '200px auto' }}>
                        <ProSidebar className='sideBar' collapsed={menuCollapse}>
                            <SidebarHeader className="sideBarHeader">
                                <p className="clickable" onClick={this.menuIconClick}>{menuCollapse ? "R.F." : "Roll Fast"}{menuCollapse ? "" : ", " + loggedInUserName}</p>
                            </SidebarHeader>
                            <SidebarContent>
                                <Menu iconShape="square">
                                    <MenuItem icon={<FaBattleNet />}>
                                        Home
                                        <Link to="/" />
                                    </MenuItem>
                                    <MenuItem icon={<FaBattleNet />}>
                                        Customers
                                        <Link to="/customers" />
                                    </MenuItem>
                                </Menu>
                            </SidebarContent>

                        </ProSidebar>
                        <div className="centerVandH">
                            <Switch>
                                <Route exact path="/customers" render={(props) => <CustomerIndex {...props} />} />
                                <Route exact path="/customers/create" render={(props) => <CustomerCreate {...props} />} />
                                <Route exact path="/customers/:id/edit" render={(props) => <CustomerEdit {...props} />} />
                                <Route exact path="/" render={(props) => <Home {...props} />} />
                            </Switch>
                        </div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default Sidebar;
