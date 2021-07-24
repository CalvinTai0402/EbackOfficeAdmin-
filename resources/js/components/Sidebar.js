import React from "react";
import { ProSidebar, SubMenu, Menu, MenuItem, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';
import { FaBattleNet, FaAdn, FaArtstation, FaGem, FaFantasyFlightGames, FaCriticalRole, FaDrupal, FaFreebsd, FaGitter, FaGratipay, FaGrav, FaGripfire } from "react-icons/fa";
import Home from "./Home"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from "react-router-dom";
import UserIndex from "./User/UserIndex";
import UserCreate from "./User/UserCreate";
import UserEdit from "./User/UserEdit";
import CustomerIndex from './Customer/CustomerIndex';
import CustomerCreate from './Customer/CustomerCreate';
import CustomerEdit from "./Customer/CustomerEdit";
import Event from "./Event/Event";
import FileManager from "./FileManager";
import AvailableTaskIndex from './AvailableTask/AvailableTaskIndex';
import AvailableTaskCreate from './AvailableTask/AvailableTaskCreate';
import AvailableTaskEdit from "./AvailableTask/AvailableTaskEdit";
import AnnouncementIndex from "./Announcement/AnnouncementIndex";
import AnnouncementCreate from "./Announcement/AnnouncementCreate";
import AnnouncementEdit from "./Announcement/AnnouncementEdit";
import SentAnnouncementsIndex from "./Announcement/SentAnnouncementsIndex";
// import ReadPage from "./Announcement/ReadPage";
import TaskListIndex from './TaskList/TaskListIndex';
import TaskListCreate from './TaskList/TaskListCreate';
import TaskListEdit from "./TaskList/TaskListEdit";
import MyTaskIndex from "./MyTask/MyTaskIndex";

import '../../css/App.css';
import 'react-pro-sidebar/dist/css/styles.css';
class Sidebar extends React.Component {
    state = {
        menuCollapse: false,
        loggedInUserName: "Guest",
        selected: "",
        color: "yellow"
    };

    async componentDidMount() {
        const res = await axios.get("/getLoggedInUsername")
        this.setState({ loggedInUserName: res.data.loggedInUserName })
    }

    logout = async () => {
        await axios.post("/logout");
        window.location.href = "/"
    }

    changeColorOnClick = (selectedLink) => {
        this.setState({ selected: selectedLink })
    }

    render() {
        const { menuCollapse, loggedInUserName, selected, color } = this.state;
        return (
            <div >
                <Router>
                    <div id="sidebar" style={{ display: 'grid', gridTemplateColumns: '200px auto' }}>
                        <ProSidebar className='sideBar' collapsed={menuCollapse} image="/sidebar/background.jpg">
                            <SidebarHeader className="sideBarHeader">
                                <p className="clickable">{"EbackOffice"}{", " + loggedInUserName}</p>
                            </SidebarHeader>
                            <SidebarContent>
                                <Menu iconShape="square">
                                    <MenuItem icon={<FaBattleNet />} onClick={() => { this.changeColorOnClick("Home") }}>
                                        <span style={{ color: selected === "Home" ? color : "" }}>
                                            Home
                                        </span>
                                        <Link to="/" />
                                    </MenuItem>
                                    <MenuItem icon={<FaAdn />} onClick={() => { this.changeColorOnClick("Users") }}>
                                        <span style={{ color: selected === "Users" ? color : "" }}>
                                            Users
                                        </span>
                                        <Link to="/users" />
                                    </MenuItem>
                                    <MenuItem icon={<FaArtstation />} onClick={() => { this.changeColorOnClick("Customers") }}>
                                        <span style={{ color: selected === "Customers" ? color : "" }}>
                                            Customers
                                        </span>
                                        <Link to="/customers" />
                                    </MenuItem>
                                    <MenuItem icon={<FaFantasyFlightGames />} onClick={() => { this.changeColorOnClick("Events") }}>
                                        <span style={{ color: selected === "Events" ? color : "" }}>
                                            Events
                                        </span>
                                        <Link to="/events" />
                                    </MenuItem>
                                    <MenuItem icon={<FaCriticalRole />} onClick={() => { this.changeColorOnClick("Files") }}>
                                        <span style={{ color: selected === "Files" ? color : "" }}>
                                            Files
                                        </span>
                                        <Link to="/filemanager" />
                                    </MenuItem>
                                    <SubMenu title="Task Settings" icon={<FaDrupal />}>
                                        <MenuItem icon={<FaFreebsd />} onClick={() => { this.changeColorOnClick("Available Tasks") }}>
                                            <span style={{ color: selected === "Available Tasks" ? color : "" }}>
                                                Available Tasks
                                            </span>
                                            <Link to="/availableTasks" />
                                        </MenuItem>
                                        <MenuItem icon={<FaGitter />} onClick={() => { this.changeColorOnClick("Task Lists") }}>
                                            <span style={{ color: selected === "Task Lists" ? color : "" }}>
                                                Task Lists
                                            </span>
                                            <Link to="/taskLists" />
                                        </MenuItem>
                                        <MenuItem icon={<FaGratipay />} onClick={() => { this.changeColorOnClick("My Tasks") }}>
                                            <span style={{ color: selected === "My Tasks" ? color : "" }}>
                                                My Tasks
                                            </span>
                                            <Link to="/mytasks" />
                                        </MenuItem>
                                    </SubMenu>
                                    <SubMenu title="Announcements" icon={<FaGem />}>
                                        <MenuItem icon={<FaGrav />} onClick={() => { this.changeColorOnClick("Announcments") }}>
                                            <span style={{ color: selected === "Announcments" ? color : "" }}>
                                                Announcments
                                            </span>
                                            <Link to="/announcements" />
                                        </MenuItem>
                                        <MenuItem icon={<FaGripfire />} onClick={() => { this.changeColorOnClick("Sent Announcments") }}>
                                            <span style={{ color: selected === "Sent Announcments" ? color : "" }}>
                                                Sent Announcments
                                            </span>
                                            <Link to="/announcementssent" />
                                        </MenuItem>
                                    </SubMenu>
                                </Menu>
                            </SidebarContent>
                            <SidebarFooter style={{ textAlign: 'center' }}>
                                <div
                                    className="sidebar-btn-wrapper"
                                    style={{
                                        padding: '20px 24px',
                                    }}
                                >
                                    <button className="sidebar-btn" onClick={this.logout}>
                                        Logout
                                    </button>
                                </div>
                            </SidebarFooter>
                        </ProSidebar>
                        <div className="centerH">
                            <Switch>
                                <Route exact path="/users" render={(props) => <UserIndex {...props} />} />
                                <Route exact path="/users/create" render={(props) => <UserCreate {...props} />} />
                                <Route exact path="/users/:id/edit" render={(props) => <UserEdit {...props} />} />

                                <Route exact path="/customers" render={(props) => <CustomerIndex {...props} />} />
                                <Route exact path="/customers/create" render={(props) => <CustomerCreate {...props} />} />
                                <Route exact path="/customers/:id/edit" render={(props) => <CustomerEdit {...props} />} />

                                <Route exact path="/events" render={(props) => <Event {...props} />} />

                                <Route exact path="/filemanager" render={(props) => <FileManager {...props} />} />

                                <Route exact path="/availableTasks" render={(props) => <AvailableTaskIndex {...props} />} />
                                <Route exact path="/availableTasks/create" render={(props) => <AvailableTaskCreate {...props} />} />
                                <Route exact path="/availableTasks/:id/edit" render={(props) => <AvailableTaskEdit {...props} />} />

                                <Route exact path="/taskLists" render={(props) => <TaskListIndex {...props} />} />
                                <Route exact path="/taskLists/create" render={(props) => <TaskListCreate {...props} />} />
                                <Route exact path="/taskLists/:id/edit" render={(props) => <TaskListEdit {...props} />} />
                                <Route exact path="/mytasks" render={(props) => <MyTaskIndex {...props} />} />

                                <Route exact path="/announcements" render={(props) => <AnnouncementIndex {...props} />} />
                                <Route exact path="/announcementssent" render={(props) => <SentAnnouncementsIndex {...props} />} />
                                <Route exact path="/announcements/create" render={(props) => <AnnouncementCreate {...props} />} />
                                <Route exact path="/announcements/:id/edit/:source" render={(props) => <AnnouncementEdit {...props} />} />
                                {/* <Route exact path="/announcements/:id/readOrUnreadPage/:reading" render={(props) => <ReadPage {...props} />} /> */}

                                <Route path="/" render={(props) => <Home {...props} />} />
                            </Switch>
                        </div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default Sidebar;
