import React from "react";
import '../../css/App.css';
import { ProSidebar, SubMenu, Menu, MenuItem, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { FaBattleNet, FaGem } from "react-icons/fa";
import Home from "./Home"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
// import CustomerIndex from './Customer/CustomerIndex';
// import CustomerCreate from './Customer/CustomerCreate';
// import CustomerEdit from "./Customer/CustomerEdit";
import AvailableTaskIndex from './AvailableTask/AvailableTaskIndex';
import AvailableTaskCreate from './AvailableTask/AvailableTaskCreate';
import AvailableTaskEdit from "./AvailableTask/AvailableTaskEdit";
import TaskListIndex from './TaskList/TaskListIndex';
import TaskListCreate from './TaskList/TaskListCreate';
import TaskListEdit from "./TaskList/TaskListEdit";
class Sidebar extends React.Component {
    state = {
        menuCollapse: false,
        loggedInUserName: "Guest",
    };

    async componentDidMount() {
        const res = await axios.get("/getLoggedInUsername")
        this.setState({ loggedInUserName: res.data.loggedInUserName })
    }

    menuIconClick = async () => {
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
                                <p className="clickable" onClick={this.menuIconClick}>{menuCollapse ? "E.B." : "EbackOffice"}{menuCollapse ? "" : ", " + loggedInUserName}</p>
                            </SidebarHeader>
                            <SidebarContent>
                                <Menu iconShape="square">
                                    <MenuItem icon={<FaBattleNet />}>
                                        Home
                                        <Link to="/" />
                                    </MenuItem>
                                    <SubMenu title="Task Settings" icon={<FaGem />}>
                                        <MenuItem icon={<FaBattleNet />}>
                                            Available Tasks
                                            <Link to="/availableTasks" />
                                        </MenuItem>
                                        <MenuItem icon={<FaBattleNet />}>
                                            Task Lists
                                            <Link to="/taskLists" />
                                        </MenuItem>
                                    </SubMenu>
                                    {/* <MenuItem icon={<FaBattleNet />}>
                                        Customers
                                        <Link to="/customers" />
                                    </MenuItem> */}
                                </Menu>
                            </SidebarContent>

                        </ProSidebar>
                        <div className="centerVandH">
                            <Switch>
                                <Route exact path="/availableTasks" render={(props) => <AvailableTaskIndex {...props} />} />
                                <Route exact path="/availableTasks/create" render={(props) => <AvailableTaskCreate {...props} />} />
                                <Route exact path="/availableTasks/:id/edit" render={(props) => <AvailableTaskEdit {...props} />} />
                                <Route exact path="/taskLists" render={(props) => <TaskListIndex {...props} />} />
                                <Route exact path="/taskLists/create" render={(props) => <TaskListCreate {...props} />} />
                                <Route exact path="/taskLists/:id/edit" render={(props) => <TaskListEdit {...props} />} />
                                {/* <Route exact path="/customers" render={(props) => <CustomerIndex {...props} />} />
                                <Route exact path="/customers/create" render={(props) => <CustomerCreate {...props} />} />
                                <Route exact path="/customers/:id/edit" render={(props) => <CustomerEdit {...props} />} /> */}
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
