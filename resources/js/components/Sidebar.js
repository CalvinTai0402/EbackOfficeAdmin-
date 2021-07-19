import React from "react";
import '../../css/App.css';
import { ProSidebar, SubMenu, Menu, MenuItem, SidebarHeader, SidebarContent, SidebarFooter } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { FaBattleNet, FaGem } from "react-icons/fa";
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
import ReadPage from "./Announcement/ReadPage";
import TaskListIndex from './TaskList/TaskListIndex';
import TaskListCreate from './TaskList/TaskListCreate';
import TaskListEdit from "./TaskList/TaskListEdit";
import MyTaskIndex from "./MyTask/MyTaskIndex";
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

    logout = async () => {
        await axios.post("/logout");
        window.location.href = "/"
    }

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
                                    <MenuItem icon={<FaBattleNet />}>
                                        Users
                                        <Link to="/users" />
                                    </MenuItem>
                                    <MenuItem icon={<FaBattleNet />}>
                                        Customers
                                        <Link to="/customers" />
                                    </MenuItem>
                                    <MenuItem icon={<FaBattleNet />}>
                                        Events
                                        <Link to="/events" />
                                    </MenuItem>
                                    <MenuItem icon={<FaBattleNet />}>
                                        Files
                                        <Link to="/filemanager" />
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
                                        <MenuItem icon={<FaBattleNet />}>
                                            My Tasks
                                            <Link to="/mytasks" />
                                        </MenuItem>
                                    </SubMenu>
                                    <SubMenu title="Announcements" icon={<FaGem />}>
                                        <MenuItem icon={<FaBattleNet />}>
                                            Unread Announcments
                                            <Link to="/announcementsunread" />
                                        </MenuItem>
                                        <MenuItem icon={<FaBattleNet />}>
                                            Read Announcments
                                            <Link to="/announcementsread" />
                                        </MenuItem>
                                        <MenuItem icon={<FaBattleNet />}>
                                            Sent Announcments
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
                        <div className="centerVandH">
                            <Switch>
                                <Route exact path="/" render={(props) => <Home {...props} />} />

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

                                <Route exact path="/announcementsunread" render={(props) => <AnnouncementIndex read={0} {...props} />} />
                                <Route exact path="/announcementsread" render={(props) => <AnnouncementIndex read={1} {...props} />} />
                                <Route exact path="/announcementssent" render={(props) => <SentAnnouncementsIndex {...props} />} />
                                <Route exact path="/announcements/create" render={(props) => <AnnouncementCreate {...props} />} />
                                <Route exact path="/announcements/:id/edit" render={(props) => <AnnouncementEdit {...props} />} />
                                <Route exact path="/announcements/:id/readingPage" render={(props) => <ReadPage reading={1} {...props} />} />
                                <Route exact path="/announcements/:id/unreadingPage" render={(props) => <ReadPage reading={0} {...props} />} />
                            </Switch>
                        </div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default Sidebar;
