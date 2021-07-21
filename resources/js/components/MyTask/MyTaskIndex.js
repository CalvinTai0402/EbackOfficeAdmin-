import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillEdit } from "react-icons/ai";
import Spinner from "../Spinner";
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

import '../../../css/TaskList.css';

class MyTaskIndex extends React.Component {
    state = {
        selectedMyTasks: [],
        myTasksIDs: [],
        isAllChecked: false,
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
        availableCustomerCodes: [],
        availableCustomerIds: [],
        userNames: [],
        userIds: [],
        rowId: "",
        errors: [],
        loading: false,
        selected: false
    };

    async componentDidMount() {
        await this.populateAvalableTaskNamesAndDecriptions()
        await this.populateAvailableUsers()
        await this.populateAvalableCustomersForTaskList()
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
        let availableCustomerIdsAndCodes = res.data.availableCustomerIdsAndCodes;
        let availableCustomerIds = availableCustomerIdsAndCodes.map((availableCustomerIdAndCode, i) => {
            let availableCustomerId = {
                value: availableCustomerIdAndCode.id,
                name: availableCustomerIdAndCode.id,
                index: i
            };
            return availableCustomerId;
        });
        let availableCustomerCodes = availableCustomerIdsAndCodes.map((availableCustomerIdAndCode, i) => {
            let availableCustomerCodes = {
                value: availableCustomerIdAndCode.code,
                name: availableCustomerIdAndCode.code,
                index: i
            };
            return availableCustomerCodes;
        });
        this.setState({ availableCustomerIds, availableCustomerCodes });
    }

    check_all = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedMyTasks = this.state.selectedMyTasks.slice();

        selectedMyTasks.includes(value) ?
            selectedMyTasks.splice(selectedMyTasks.indexOf(value), 1) :
            selectedMyTasks.push(value);

        this.setState({ selectedMyTasks: selectedMyTasks }, () => {
            this.check_all.current.checked = _.difference(this.state.myTasksIDs, this.state.selectedMyTasks).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedMyTasks: [...new Set(this.state.selectedMyTasks.concat(this.state.myTasksIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.myTasksIDs, this.state.selectedMyTasks).length === 0;
        });
    }

    handleEditClicked = async (id) => {
        const { userNames } = this.state;
        let res = await axios.get(`${process.env.MIX_API_URL}/myTasks/${id}/edit`);
        let duedateParts = res.data.myTask.duedate.split("-");
        let selectedDate = moment(duedateParts[2] + "-" + duedateParts[0] + "-" + duedateParts[1] + "T00:00:00")._d
        this.setState({
            name: res.data.myTask.name,
            description: res.data.myTask.description,
            notes: res.data.myTask.notes,
            duedate: res.data.myTask.duedate,
            selectedDate: selectedDate,
            repeat: res.data.myTask.repeat,
            priority: res.data.myTask.priority,
            status: res.data.myTask.status,
            rowId: id,
            asigneeIds: res.data.myTask.asigneeIds,
            initialAssignees: res.data.myTask.initialAssignees,
            selected: true,
            customerCode: res.data.myTask.customer_code,
            customerId: res.data.myTask.customer_id,
        });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status, rowId, asigneeIds, customerId, customerCode } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.put(`${process.env.MIX_API_URL}/myTasks/${rowId}`, {
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
                this.props.history.push("/myTasks");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, customerCode, description, duedate, repeat, priority, status, asigneeIds }) => {
        if (name && customerCode, description && duedate && repeat && priority && status && asigneeIds.length != 0) { return true }
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
        const { availableTaskNames, availableTaskDescriptions, availableCustomerIds, availableCustomerCodes } = this.state;
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
            case "availableCustomerCodes":
                let selectedCode = obj.value;
                for (let i = 0; i < availableCustomerCodes.length; i++) {
                    if (selectedCode === availableCustomerCodes[i].value) {
                        index = i
                        break
                    }
                }
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

    render() {
        const { name, description, notes, initialAssignees, selectedDate, repeat, priority, status, availableTaskNames, availableCustomerCodes, customerCode, userNames, errors, loading, selected } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/myTasks`;
        const columns = ['id', 'name', 'description', 'duedate', 'priority', 'status', 'assigneeNames', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 5,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput, assigneeNames: "Assignee" },
            sortable: ['name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status', 'assigneeNames', 'customer_code'],
            columnsAlign: { id: 'center' },
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let myTasksIDs = res.data.map(a => a.id.toString());
                self.setState({ myTasksIDs: myTasksIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.myTasksIDs, self.state.selectedMyTasks).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: 'Task Lists  '
            },
        };

        return (
            <div>
                {loading ? <Spinner text="Updating..." /> :
                    <div>
                        <Header as='h2' icon textAlign='center'>
                            <Icon name='list' circular />
                            <Header.Content>My Tasks</Header.Content>
                        </Header>
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl search={false}>
                            {
                                function (row, column) {
                                    switch (column) {
                                        case 'id':
                                            return (
                                                <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                    onChange={self.handleCheckboxTableChange}
                                                    checked={self.state.selectedMyTasks.includes(row.id.toString())} />
                                            );
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }} onClick={() => self.handleEditClicked(row.id.toString())}>
                                                    <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                        <AiFillEdit color="white" />
                                                        <div style={{ color: "white" }} >
                                                            Edit
                                                        </div>
                                                    </button>
                                                </div>

                                            );
                                        default:
                                            return (row[column]);
                                    }
                                }
                            }
                        </ServerTable >
                        <div>
                            <Grid textAlign="center" verticalAlign="middle" className="app">
                                <Grid.Column style={{ maxWidth: 450 }}>
                                    {selected ? <div><Header as="h1" icon color="blue" textAlign="center" style={{ marginTop: "20px" }}>
                                        Editing: {name}
                                    </Header>
                                        <Form onSubmit={this.handleUpdate} size="large">
                                            <Segment stacked>
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
                                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "availableCustomerCodes")}
                                                        filterOptions={fuzzySearch}
                                                        options={availableCustomerCodes}
                                                        placeholder="Choose a customer code"
                                                        value={customerCode}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Description</label>
                                                    <Form.Input
                                                        fluid
                                                        name="description"
                                                        // onChange={this.handleChange}
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
                                                            { value: 'Done', name: 'Done' },
                                                            { value: 'In progress', name: 'In progress' },
                                                            { value: "Haven't started", name: "Haven't started" },
                                                        ]}
                                                        placeholder="Choose a status"
                                                        value={status}
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
                                            </Segment>
                                        </Form>
                                        {errors.length > 0 && (
                                            <Message error>
                                                <h3>Error</h3>
                                                {this.displayErrors(errors)}
                                            </Message>
                                        )}</div> :
                                        <Header as="h1" icon color="blue" textAlign="center" style={{ marginTop: "20px" }}>
                                            Select a task to edit
                                        </Header>}
                                </Grid.Column>
                            </Grid>
                        </div>
                    </div>}
            </div>
        );
    }
}

export default MyTaskIndex;