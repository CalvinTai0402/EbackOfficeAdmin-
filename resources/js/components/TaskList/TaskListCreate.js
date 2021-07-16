import React, { Component } from 'react';
import {
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
    Icon
} from "semantic-ui-react";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";

import "react-datepicker/dist/react-datepicker.css";

class TaskListCreate extends Component {
    state = {
        name: "",
        description: "",
        notes: "",
        duedate: "",
        selectedDate: "",
        repeat: "",
        priority: "",
        status: "",
        asigneeIds: [],
        availableTaskNames: [],
        availableTaskDescriptions: [],
        userNames: [],
        userIds: [],
        errors: [],
        loading: false,
    }

    async componentDidMount() {
        await this.populateAvalableTaskNamesAndDecriptions()
        await this.populateAvailableUsers()
    }

    populateAvalableTaskNamesAndDecriptions = async () => {
        let res = await axios.get(`/availableTasks/populateAvalableTasksForTaskList`);
        let availableTaskNamesAndDescriptions = res.data.availableTaskNamesAndDescriptions;
        let availableTaskNames = availableTaskNamesAndDescriptions.map((availableTaskNameAndDescription, i) => {
            let availableTaskName = {
                value: availableTaskNameAndDescription.name,
                name: availableTaskNameAndDescription.name,
                index: i
            };
            return availableTaskName;
        });
        let availableTaskDescriptions = availableTaskNamesAndDescriptions.map((availableTaskNameAndDescription, i) => {
            let availableTaskDescription = {
                value: availableTaskNameAndDescription.description,
                name: availableTaskNameAndDescription.description,
                index: i
            };
            return availableTaskDescription;
        });
        this.setState({
            availableTaskNames: availableTaskNames,
            availableTaskDescriptions: availableTaskDescriptions
        });
    }

    populateAvailableUsers = async () => {
        let res = await axios.get(`/users/populateUsersForTaskList`);
        let userIdsAndNames = res.data.userIdsAndNames;
        let userNames = userIdsAndNames.map((userIdAndName, i) => {
            let userName = {
                value: userIdAndName.name,
                name: userIdAndName.name,
                index: i
            };
            return userName;
        });
        let userIds = userIdsAndNames.map((userIdAndName, i) => {
            let userId = {
                value: userIdAndName.id,
                name: userIdAndName.id,
                index: i
            };
            return userId;
        });
        this.setState({
            userNames: userNames,
            userIds: userIds
        });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleStore = async event => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status, asigneeIds } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.post('/taskLists', {
                name: name,
                description: description,
                notes: notes,
                duedate: duedate,
                repeat: repeat,
                priority: priority,
                status: status,
                asigneeIds: asigneeIds
            });
            if (res.data.status === 422) {
                this.setState({ loading: false });
                let validationErrors = res.data.errors;
                this.setState({ errors: [] }, () => {
                    const { errors } = this.state;
                    for (let key of Object.keys(validationErrors)) {
                        let errorArrayForOneField = validationErrors[key]
                        errorArrayForOneField.forEach(function (errorMessage, index) {
                            errors.push(errorMessage)
                        });
                    }
                    this.setState({ errors })
                });
            }
            else if (res.data.status === 200) {
                this.setState({ loading: false });
                this.props.history.push("/taskLists");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, description, duedate, repeat, priority, status, asigneeIds }) => {
        if (name && description && duedate && repeat && priority && status && asigneeIds.length != 0) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (description.length === 0) {
                errors.push("Description cannot be empty")
            }
            if (duedate.length === 0) {
                errors.push("Due date cannot be empty")
            }
            if (repeat.length === 0) {
                errors.push("Repeat frequency cannot be empty")
            }
            if (priority.length === 0) {
                errors.push("Priority cannot be empty")
            }
            if (status.length === 0) {
                errors.push("Status cannot be empty")
            }
            if (asigneeIds.length === 0) {
                errors.push("Asignee cannot be empty")
            }
            this.setState({ errors })
        });
    };

    setDate = (date) => {
        const dateString = moment(date).format("MM-DD-yyyy")
        this.setState({
            duedate: dateString,
            selectedDate: date
        })
    }

    handleSelectChange = (value, obj, field) => {
        const { availableTaskNames, availableTaskDescriptions } = this.state;
        switch (field) {
            case "availableTaskName":
                let index;
                let availableTaskName = obj.value;
                for (let i = 0; i < availableTaskNames.length; i++) {
                    if (availableTaskName === availableTaskNames[i].value) {
                        index = i
                    }
                }
                this.setState({
                    name: obj.value,
                    description: availableTaskDescriptions[index].name
                })
                break
            case "repeat":
                this.setState({ repeat: obj.value })
                break;
            case "priority":
                this.setState({ priority: obj.value })
                break;
            case "status":
                this.setState({ status: obj.value })
                break;
            default:
        }
    }

    handleMultipleSelectChange = (value, objArray, field) => {
        switch (field) {
            case "asignee":
                const { userIds, userNames } = this.state;
                let asigneeIds = []
                if (objArray.length == 0) {
                    this.setState({ asigneeIds: [] })
                } else {
                    for (let i = 0; i < objArray.length; i++) {
                        let userName = objArray[i].value;
                        for (let i = 0; i < userNames.length; i++) {
                            if (userName === userNames[i].value) {
                                asigneeIds.push(userIds[i].value)
                            }
                        }
                    }
                    this.setState({ asigneeIds: asigneeIds })
                }
                break
            default:
        }

    }

    render() {
        const { description, notes, selectedDate, availableTaskNames, userNames, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="tasks" color="blue" />
                            Create Task
                        </Header>
                        <Form onSubmit={this.handleStore} size="large" autoComplete="off">
                            <Segment stacked>
                                <Form.Field className={this.handleInputError(errors, "name")}>
                                    <label>Name</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "availableTaskName")}
                                        filterOptions={fuzzySearch}
                                        options={availableTaskNames}
                                        placeholder="Choose a task name"
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Description</label>
                                    <Form.Input
                                        fluid
                                        name="description"
                                        value={description}
                                        className={this.handleInputError(errors, "description")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Notes</label>
                                    <Form.Input
                                        fluid
                                        name="notes"
                                        onChange={this.handleChange}
                                        value={notes}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "due")}>
                                    <label>Due date</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => this.setDate(date)}
                                        dateFormat="MM-dd-yyyy"
                                        closeOnScroll={(e) => e.target === document}
                                        wrapperClassName="datePicker"
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "repeat")}>
                                    <label>Repeat</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "repeat")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'Daily', name: 'Daily' },
                                            { value: 'Weekly', name: 'Weekly' },
                                            { value: 'Monthly', name: 'Monthly' },
                                            { value: 'Yearly', name: 'Yearly' }
                                        ]}
                                        placeholder="Choose a repeat frequency"
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "priority")}>
                                    <label>Priority</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "priority")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'High', name: 'High' },
                                            { value: 'Medium', name: 'Medium' },
                                            { value: 'Low', name: 'Low' },
                                        ]}
                                        placeholder="Choose a priority"
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "status")}>
                                    <label>Status</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "status")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'Done', name: 'Done' },
                                            { value: 'In progress', name: 'In progress' },
                                            { value: "Haven't started", name: "Haven't started" },
                                        ]}
                                        placeholder="Choose a status"
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "asignee")}>
                                    <label>Assignee(s)</label>
                                    <SelectSearch
                                        search
                                        filterOptions={fuzzySearch}
                                        closeOnSelect={false}
                                        printOptions="on-focus"
                                        multiple
                                        placeholder="Choose assignee(s)"
                                        onChange={(value, objArray) => this.handleMultipleSelectChange(value, objArray, "asignee")}
                                        options={userNames}
                                    />
                                </Form.Field>
                                <Button
                                    disabled={loading}
                                    className={loading ? "loading" : ""}
                                    color="blue"
                                    fluid
                                    size="large"
                                >
                                    Create Task
                                </Button>
                            </Segment>
                        </Form>
                        {errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3>
                                {this.displayErrors(errors)}
                            </Message>
                        )}
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default TaskListCreate;