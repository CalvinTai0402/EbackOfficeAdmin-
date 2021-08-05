import React, { Component } from 'react';
import {
    Grid,
    Form,
    Button,
    Header,
} from "semantic-ui-react";
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";
import Spinner from '../Spinner'

class PreferenceEdit extends Component {
    state = {
    }

    render() {
        const { usersPerPage, customersPerPage, availableTasksPerPage, taskListsPerPage, myTasksPerPage, auditsPerPage,
            announcementsPerPage, sidebarTextColor, sidebarTextSelectedColor, sentAnnouncementsPerPage, loading } = this.props;
        let options = [
            { value: '5', name: '5' },
            { value: '10', name: '10' },
            { value: '20', name: '20' },
            { value: '25', name: '25' },
            { value: '100', name: '100' }
        ];
        return (

            <div>{loading ? <Spinner text="Loading..." /> :
                <div>
                    <Header as="h1" icon color="blue" textAlign="center">
                        Edit Preferences
                    </Header>
                    <Form onSubmit={this.props.handleUpdate} size="large">
                        <Grid className="app">
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Users Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of users per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "users")}
                                            options={options}
                                            value={usersPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Customers Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of customers per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "customers")}
                                            options={options}
                                            value={customersPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Available Tasks Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of available tasks per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "availableTasks")}
                                            options={options}
                                            value={availableTasksPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Tasks Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of tasks per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "tasks")}
                                            options={options}
                                            value={taskListsPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>My Tasks Per Page</label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of my tasks per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "mytasks")}
                                            options={options}
                                            value={myTasksPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Audits Per Page</label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of audits per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "audits")}
                                            options={options}
                                            value={auditsPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Announcements Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of announcements per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "announcements")}
                                            options={options}
                                            value={announcementsPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Sent Announcements Per Page </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose # of sent announcements per page"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "sentAnnouncements")}
                                            options={options}
                                            value={sentAnnouncementsPerPage}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Sidebar Selected Color</label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose color of selected text"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "sidebarTextSelectedColor")}
                                            options={[
                                                { value: 'cyan', name: 'cyan' },
                                                { value: 'yellow', name: 'yellow' },
                                                { value: 'green', name: 'green' },
                                                { value: 'red', name: 'red' },
                                                { value: 'blue', name: 'blue' },
                                            ]}
                                            value={sidebarTextSelectedColor}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Form.Field>
                                        <label>Sidebar Text Color </label>
                                        <SelectSearch
                                            search
                                            filterOptions={fuzzySearch}
                                            closeOnSelect={false}
                                            printOptions="on-focus"
                                            placeholder="Choose color of sidebar text"
                                            onChange={(value, objArray) => this.props.handleSelectChange(value, objArray, "sidebarTextColor")}
                                            options={[
                                                { value: 'white', name: 'white' },
                                                { value: 'grey', name: 'grey' },
                                            ]}
                                            value={sidebarTextColor}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <Button
                                        disabled={loading}
                                        className={loading ? "loading" : ""}
                                        color="blue"
                                        fluid
                                        size="large"
                                    >
                                        Update Preferences
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </div>}
            </div>
        );
    }
}

export default PreferenceEdit;