import React, { Component } from 'react';
import {
    Grid,
    Form,
    Button,
    Header,
    Message,
    Icon,
    TextArea
} from "semantic-ui-react";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";

import "react-datepicker/dist/react-datepicker.css";

class TaskListEdit extends Component {
    state = {
        name: "",
        customerCode: "",
        customerId: 0,
        description: "",
        notes: "",
        duedate: "",
        selectedDate: "",
        repeat: "",
        priority: "",
        status: "",
        asigneeIds: [],
        initialAssignees: [],
        availableTaskNames: [],
        availableTaskDescriptions: [],
        availableCustomerCodesAndNames: [],
        availableCustomerIds: [],
        userNames: [],
        userIds: [],
        errors: [],
        loading: false
    }

    async componentDidMount() {
        await this.populateAvalableTaskNamesAndDecriptions()
        await this.populateAvailableUsers()
        await this.populateAvalableCustomersForTaskList()
        const { userNames } = this.state;
        const id = this.props.match.params.id;
        let res = await axios.get(`${process.env.MIX_API_URL}/taskLists/${id}/edit`);
        let duedateParts = res.data.taskList.duedate.split("-");
        let selectedDate = moment(duedateParts[2] + "-" + duedateParts[0] + "-" + duedateParts[1] + "T00:00:00")._d
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
            initialAssignees: res.data.taskList.initialAssignees,
            customerCode: res.data.taskList.customer_code,
            customerId: res.data.taskList.customer_id,
        });
    }

    populateAvalableTaskNamesAndDecriptions = async () => {
        let res = await axios.get(`${process.env.MIX_API_URL}/availableTasks/populateAvalableTasksForTaskList`);
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
        let res = await axios.get(`${process.env.MIX_API_URL}/users/populateUsersForTaskList`);
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

    populateAvalableCustomersForTaskList = async () => {
        let res = await axios.get(`${process.env.MIX_API_URL}/customers/populateAvailableCustomersForTaskList`);
        let availableCustomerDetails = res.data.availableCustomerDetails;
        let availableCustomerIds = availableCustomerDetails.map((availableCustomerDetail, i) => {
            let availableCustomerId = {
                value: availableCustomerDetail.id,
                name: availableCustomerDetail.id,
                index: i
            };
            return availableCustomerId;
        });
        let availableCustomerCodesAndNames = availableCustomerDetails.map((availableCustomerDetail, i) => {
            let availableCustomerCodeAndName = {
                value: availableCustomerDetail.code + ":" + availableCustomerDetail.name,
                name: availableCustomerDetail.code + ":" + availableCustomerDetail.name,
                index: i
            };
            return availableCustomerCodeAndName;
        });
        this.setState({ availableCustomerIds, availableCustomerCodesAndNames });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status, asigneeIds, customerId, customerCode } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`${process.env.MIX_API_URL}/taskLists/${id}`, {
                name: name,
                customer_code: customerCode,
                description: description,
                notes: notes,
                duedate: duedate,
                repeat: repeat,
                priority: priority,
                status: status,
                asigneeIds: asigneeIds,
                customer_id: customerId
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
                let { limit, currentPage } = this.props.location;
                if (limit == null) { limit = 20 }
                if (currentPage == null) { currentPage = 1 }
                this.props.history.push(`/taskLists?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, customerCode, description, duedate, repeat, priority, status, asigneeIds }) => {
        if (name && customerCode && description && duedate && repeat && priority && status && asigneeIds.length != 0) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (customerCode.length === 0) {
                errors.push("Customer code cannot be empty")
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

    handleSelectChange = (value, obj, field) => {
        const { availableTaskNames, availableTaskDescriptions, availableCustomerIds, availableCustomerCodesAndNames } = this.state;
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
            case "availableCustomerCodesAndNames":
                let selectedCode = obj.value;
                for (let i = 0; i < availableCustomerCodesAndNames.length; i++) {
                    if (selectedCode === availableCustomerCodesAndNames[i].value) {
                        index = i
                        break
                    }
                }
                // let colonIndex = obj.value.indexOf(":");
                // let customerCode = obj.value.substring(0, colonIndex);
                this.setState({
                    customerCode: obj.value,
                    customerId: availableCustomerIds[index].value
                })
                break;
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

    redirectBack = (event) => {
        event.preventDefault()
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        this.props.history.push(`/taskLists?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
    }

    render() {
        const { name, description, notes, initialAssignees, selectedDate, repeat, priority, status, availableTaskNames, availableCustomerCodesAndNames, customerCode, userNames, errors, loading } = this.state;
        return (
            <div>
                <Form onSubmit={this.handleUpdate} size="large">
                    <Header as="h1" icon color="blue" textAlign="center">
                        <Icon name="tasks" color="blue" />
                        Edit Task
                    </Header>
                    <Grid className="app">
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <Form.Field className={this.handleInputError(errors, "name")}>
                                    <label>Name</label>
                                    <SelectSearch
                                        style={{ color: "black" }}
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "availableTaskName")}
                                        filterOptions={fuzzySearch}
                                        options={availableTaskNames}
                                        placeholder="Choose a task"
                                        value={name}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "customer")}>
                                    <label>Customer Code</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "availableCustomerCodesAndNames")}
                                        filterOptions={fuzzySearch}
                                        options={availableCustomerCodesAndNames}
                                        placeholder="Choose a customer code"
                                        value={customerCode}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "description")}>
                                    <label>Description</label>
                                    <TextArea
                                        name="description"
                                        value={description}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Notes</label>
                                    <TextArea
                                        name="notes"
                                        onChange={this.handleChange}
                                        value={notes}
                                    />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column width={8}>
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
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "repeat")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'Daily', name: 'Daily' },
                                            { value: 'Weekly', name: 'Weekly' },
                                            { value: 'Monthly', name: 'Monthly' },
                                            { value: 'Yearly', name: 'Yearly' }
                                        ]}
                                        placeholder="Choose a repeat frequency"
                                        value={repeat}
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
                                        value={priority}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "status")}>
                                    <label>Status</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "status")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'No Status', name: 'No Status' },
                                            { value: 'Not Started', name: 'Not Started' },
                                            { value: 'In progress', name: 'In progress' },
                                            { value: "On Hold", name: "On Hold" },
                                            { value: 'Completed', name: 'Completed' },
                                            { value: 'Draft', name: 'Draft' },
                                            { value: "Needs Review", name: "Needs Review" },
                                            { value: 'With Client', name: 'With Client' },
                                            { value: 'Waiting on Client', name: 'Waiting on Client' },
                                        ]}
                                        placeholder="Choose a status"
                                        value={status}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "asignee")}>
                                    <label>Assignee(s)</label>
                                    <SelectSearch
                                        search
                                        closeOnSelect={false}
                                        printOptions="on-focus"
                                        multiple
                                        placeholder="Choose assignee(s)"
                                        onChange={(value, objArray) => this.handleMultipleSelectChange(value, objArray, "asignee")}
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
                                <Button
                                    disabled={loading}
                                    className={loading ? "loading" : ""}
                                    color="green"
                                    fluid
                                    size="large"
                                    onClick={this.redirectBack}
                                    style={{ marginTop: "5px" }}
                                >
                                    Back
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {this.displayErrors(errors)}
                    </Message>
                )}
            </div>
        );
    }
}

export default TaskListEdit;