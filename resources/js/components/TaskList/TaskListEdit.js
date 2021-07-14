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

class TaskListEdit extends Component {
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
        initialAssignees: [], // e.g. ["userName0", "userName1"]
        availableTaskNames: [],
        availableTaskDescriptions: [],
        userNames: [],
        userIds: [],
        errors: [],
        loading: false
    }

    async componentDidMount() {
        await this.populateAvalableTaskNamesAndDecriptions()
        await this.populateAvailableUsers()
        const {userNames} = this.state;
        const id = this.props.match.params.id;
        let res = await axios.get(`/taskLists/${id}/edit`);
        let duedateParts = res.data.taskList.duedate.split("-");
        let selectedDate = moment(duedateParts[2] + "-" + duedateParts[0] + "-" + duedateParts[1] + "T00:00:00")._d
        let initialAssignees = []
        if (res.data.taskList.initialAssignees.length > 0){
            initialAssignees = res.data.taskList.initialAssignees.map((initialAssignee, i) => {
                for (let i = 0; i < userNames.length; i++) {
                    if (userNames[i].name === initialAssignee){
                        return userNames[i].value;
                    }
                }
            });
        }
        this.setState({
            name: res.data.taskList.name,
            description: res.data.taskList.description,
            notes: res.data.taskList.notes,
            duedate: res.data.taskList.duedate,
            selectedDate: selectedDate,
            repeat: res.data.taskList.repeat,
            priority: res.data.taskList.priority,
            status: res.data.taskList.status,
            asigneeIds: res.data.taskList.asigneeIds,
            initialAssignees: initialAssignees,
        });
    }

    populateAvalableTaskNamesAndDecriptions = async () => {
        let res = await axios.get(`/availableTasks/populateAvalableTasksForTaskList`);
        let availableTaskNamesAndDescriptions = res.data.availableTaskNamesAndDescriptions;
        let availableTaskNames = availableTaskNamesAndDescriptions.map((availableTaskNameAndDescription, i) => {
            let availableTaskName = {
                value: "availableTaskName" + i,
                name: availableTaskNameAndDescription.name
            };
            return availableTaskName;
        });
        let availableTaskDescriptions = availableTaskNamesAndDescriptions.map((availableTaskNameAndDescription, i) => {
            let availableTaskDescription = {
                value: "availableTaskDescriptions" + i,
                name: availableTaskNameAndDescription.description
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
                value: "userName" + i,
                name: userIdAndName.name
            };
            return userName;
        });
        let userIds = userIdsAndNames.map((userIdAndName, i) => {
            let userId = {
                value: "userId" + i,
                name: userIdAndName.id
            };
            return userId;
        });
        this.setState({
            userNames: userNames,
            userIds: userIds
        });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status, asigneeIds } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`/taskLists/${id}`, {
                name: name,
                description: description,
                notes: notes,
                duedate: duedate,
                repeat: repeat,
                priority: priority,
                status: status,
                asigneeIds: asigneeIds,
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
        if (name && description && duedate && repeat && priority && status && asigneeIds.length != 0 ) { return true }
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
            this.setState({ errors }) // the reason for this is to re-render
        });
    };

    setDate = (date) => {
        const dateString = moment(date).format("MM-DD-yyyy")
        this.setState({
            duedate: dateString,
            selectedDate: date
        })
    }

    handleSelectChange = (value, obj) => {
        const { availableTaskDescriptions } = this.state;
        switch (obj.value.slice(0, -1)) {
            case "repeat":
                this.setState({ repeat: obj.name })
                break;
            case "priority":
                this.setState({ priority: obj.name })
                break;
            case "status":
                this.setState({ status: obj.name })
                break;
            // case "availableTaskName":
            //     this.setState({ name: obj.name })
            //     this.setState({ description: availableTaskDescriptions[obj.index].name })
            default:
                this.setState({ name: obj.name })
                this.setState({ description: availableTaskDescriptions[obj.index].name })
        }
    }

    handleMultipleSelectChange = (value, objArray) => {
        const { userIds } = this.state;
        let asigneeIds = []
        if (objArray.length == 0){
            this.setState({ asigneeIds: [] })
        } else if (objArray[objArray.length - 1].value.includes("userName")) {
            for (let i = 0; i < objArray.length; i++) {
                asigneeIds.push(userIds[objArray[i].index].name)
            }
            this.setState({ asigneeIds: asigneeIds })
        }
    }

    render() {
        const { name, description, notes, initialAssignees, selectedDate, repeat, priority, status, availableTaskNames, userNames, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="tasks" color="blue" />
                            Edit Task
                        </Header>
                        <Form onSubmit={this.handleUpdate} size="large">
                            <Segment stacked>
                                <Form.Field className={this.handleInputError(errors, "name")}>
                                    <label>Name</label>
                                    <SelectSearch
                                        style={{ color: "black" }}
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj)}
                                        filterOptions={fuzzySearch}
                                        options={availableTaskNames}
                                        placeholder={name}
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
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "repeat")}>
                                    <label>Repeat</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj)}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'repeat0', name: 'Daily' },
                                            { value: 'repeat1', name: 'Weekly' },
                                            { value: 'repeat2', name: 'Monthly' },
                                            { value: 'repeat3', name: 'Yearly' }
                                        ]}
                                        placeholder={repeat}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "priority")}>
                                    <label>Priority</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj)}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'priority0', name: 'High' },
                                            { value: 'priority1', name: 'Medium' },
                                            { value: 'priority2', name: 'Low' },
                                        ]}
                                        placeholder={priority}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "status")}>
                                    <label>Status</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj)}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'status0', name: 'Done' },
                                            { value: 'status1', name: 'In progress' },
                                            { value: 'status2', name: "Haven't started" },
                                        ]}
                                        placeholder={status}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "asignee")}>
                                    <label>Asignee(s)</label>
                                    <SelectSearch
                                        search
                                        closeOnSelect={false}
                                        printOptions="on-focus"
                                        multiple
                                        placeholder="Choose asignee(s)"
                                        onChange={(value, objArray) => this.handleMultipleSelectChange(value, objArray)}
                                        filterOptions={fuzzySearch}
                                        options={userNames}
                                        value={initialAssignees}
                                    />
                                </Form.Field>
                                <Button
                                    disabled={loading}
                                    className={loading ? "loading" : ""}
                                    color="blue"
                                    fluid
                                    size="large"
                                >
                                    Update
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

export default TaskListEdit;