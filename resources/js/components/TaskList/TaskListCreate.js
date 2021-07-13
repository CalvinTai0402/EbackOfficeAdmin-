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
        availableTaskNames: [],
        availableTaskDescriptions: [],
        errors: [],
        loading: false,
    }

    async componentDidMount() {
        const res = await axios.get(`/availableTasks/populateAvalableTasksForTaskList`);
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
        this.setState({ availableTaskNames: availableTaskNames });
        this.setState({ availableTaskDescriptions: availableTaskDescriptions });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleStore = async event => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status } = this.state;
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

    isFormValid = ({ name, description, duedate, repeat, priority, status }) => {
        if (name && description && duedate && repeat && priority && status) { return true }
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
            this.setState({ errors })
        });
    };

    setDate = (date) => {
        console.log(date)
        console.log(typeof (date))
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
            case "availableTaskName":
                this.setState({ name: obj.name })
                this.setState({ description: availableTaskDescriptions[obj.index].name })
            default:
        }
    }

    render() {
        const { description, notes, selectedDate, availableTaskNames, errors, loading } = this.state;
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
                                        onChange={(value, obj) => this.handleSelectChange(value, obj)}
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
                                        placeholder="Choose a repeat frequency"
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
                                        placeholder="Choose a priority"
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
                                        placeholder="Choose a status"
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