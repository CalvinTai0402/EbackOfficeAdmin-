import React from 'react';
// import ServerTable from 'react-strap-table';
import ServerTable from '../ServerTable';
import { AiFillEdit } from "react-icons/ai";
import Spinner from "../Spinner";
import {
    Grid,
    Form,
    TextArea,
    Button,
    Header,
    Message,
    Icon
} from "semantic-ui-react";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";
import CredentialIndex from '../Credential/CredentialIndex';

import '../../../css/MyTask.css';

// let currentPage = "1";
class MyTaskIndex extends React.Component {

    state = {
        selectedMyTasks: [],
        myTasksIDs: [],
        isAllChecked: false,
        name: "",
        customerCode: "",
        customerId: 0,
        customerName: "",
        customerRemark: "",
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
        availableCustomerNames: [],
        availableCustomerRemarks: [],
        availableCustomerCodes: [],
        availableCustomerIds: [],
        credentials: [],
        userNames: [],
        userIds: [],
        rowId: "",
        errors: [],
        loading: false,
        selected: false,
        currentPage: 1,
        limit: this.props.perPage,
        filterFutureValue: false,
        filterCompletedValue: true,
        minutes: 0,
        inlineMinutes: 0,
    };

    async componentDidMount() {
        await this.populateAvalableTaskNamesAndDecriptions()
        await this.populateAvailableUsers()
        await this.populateAvailableCustomersForTaskList()
        await this.setDropDownValue()
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

    populateAvailableCustomersForTaskList = async () => {
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
        let availableCustomerCodes = availableCustomerDetails.map((availableCustomerDetail, i) => {
            let availableCustomerCode = {
                value: availableCustomerDetail.code,
                name: availableCustomerDetail.code,
                index: i
            };
            return availableCustomerCode;
        });
        let availableCustomerNames = availableCustomerDetails.map((availableCustomerDetail, i) => {
            let availableCustomerName = {
                value: availableCustomerDetail.name,
                name: availableCustomerDetail.name,
                index: i
            };
            return availableCustomerName;
        });
        let availableCustomerRemarks = availableCustomerDetails.map((availableCustomerDetail, i) => {
            let availableCustomerRemark = {
                value: availableCustomerDetail.remark,
                name: availableCustomerDetail.remark,
                index: i
            };
            return availableCustomerRemark;
        });
        this.setState({ availableCustomerIds, availableCustomerCodes, availableCustomerNames, availableCustomerRemarks });
    }

    setDropDownValue = async () => {
        let pageSelect = document.getElementsByTagName("select")[0];
        pageSelect.value = this.state.limit;
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

    handleEditClicked = async (id, element) => {
        const urlParams = new URLSearchParams(window.location.search);
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
            customerCode: res.data.myTask.customer.code,
            customerId: res.data.myTask.customer.id,
            customerName: res.data.myTask.customer.name,
            customerRemark: res.data.myTask.customer.remark,
            currentPage: urlParams.get('page'),
            limit: urlParams.get('limit'),
            minutes: res.data.myTask.minutes,
        });
        await this.populateCredentialsForCustomers(this.state.customerId);
    }

    updateFilters = async (filterFutureValue, filterCompletedValue) => {
        this.setState({ filterFutureValue, filterCompletedValue });
    }

    populateCredentialsForCustomers = async (id) => {
        let res = await axios.get(`${process.env.MIX_API_URL}/credentials/${id}/populateCredentialsForCustomers`);
        this.setState({ credentials: res.data.credentials });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    initializeInlineMinutes = value => { this.setState({ inlineMinutes: value }); };

    handleInlineMinutesChange = event => { this.setState({ inlineMinutes: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        this.setState({ myTasksIDs: [], selected: false })
        const { name, description, notes, duedate, repeat, priority, status, rowId, asigneeIds, customerId, customerCode, currentPage, limit, minutes } = this.state;
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
                customer_id: customerId,
                minutes: minutes
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
                this.props.history.push(`/mytasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
                this.goToPage()
                this.setDropDownValue()
            }
        }
    };

    goToPage = async () => {
        const { currentPage } = this.state;
        let i = 0;
        while (this.state.myTasksIDs.length <= 0 && i < 100) {
            await this.sleep(1000);
            i += 1;
        }
        const paginationLinks = document.getElementsByClassName("page-link");
        paginationLinks[currentPage].click()
    }

    sleep = async (msec) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    handleUpdateStatus = async (value, obj, rowId) => {
        const urlParams = new URLSearchParams(window.location.search);
        this.setState({
            loading: true,
            currentPage: urlParams.get('page'),
            limit: urlParams.get('limit'),
            myTasksIDs: [],
        });
        const res = await axios.put(`${process.env.MIX_API_URL}/myTasks/updateStatus/${rowId}`, {
            status: obj.value,
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
            this.setState({ loading: false, selected: false });
            const { limit, currentPage } = this.state;
            this.props.history.push(`/mytasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            this.goToPage()
            this.setDropDownValue()
        }
    };

    handleInlineMinutesUpdate = async (rowId) => {
        const urlParams = new URLSearchParams(window.location.search);
        this.setState({
            loading: true,
            currentPage: urlParams.get('page'),
            limit: urlParams.get('limit'),
            myTasksIDs: [],
        });
        const res = await axios.put(`${process.env.MIX_API_URL}/myTasks/updateMinutes/${rowId}`, {
            minutes: this.state.inlineMinutes,
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
            this.setState({ loading: false, selected: false });
            const { limit, currentPage } = this.state;
            this.props.history.push(`/mytasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            this.goToPage()
            this.setDropDownValue()
        }
    };

    setStatusForMany = async (value, obj, rowId) => {
        const urlParams = new URLSearchParams(window.location.search);
        this.setState({
            loading: true,
            currentPage: urlParams.get('page'),
            limit: urlParams.get('limit'),
            myTasksIDs: [],
        });
        const res = await axios.post(`${process.env.MIX_API_URL}/myTasks/setStatusForMany`, {
            status: obj.value,
            selectedMyTasks: this.state.selectedMyTasks,
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
            this.setState({ loading: false, selected: false });
            const { limit, currentPage } = this.state;
            this.props.history.push(`/mytasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            this.goToPage()
            this.setDropDownValue()
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

    backToList = () => {
        const urlParams = new URLSearchParams(window.location.search);
        this.setState({
            currentPage: urlParams.get('page'),
            limit: urlParams.get('limit'),
            myTasksIDs: [],
            selected: !this.state.selected
        }, () => {
            this.setDropDownValue()
            this.goToPage()
        })
    }

    render() {
        const { name, description, notes, initialAssignees, selectedDate, repeat, priority, customerName, customerRemark,
            status, availableTaskNames, availableCustomerCodes, customerCode, userNames, errors, loading, selected,
            currentPage, limit, credentials, filterFutureValue, filterCompletedValue, minutes, inlineMinutes } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/myTasks`;
        const columns = ['id', 'name', 'customer_code', 'duedate', 'priority', 'status', 'minutes', 'assigneeNames', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: limit,
            perPageValues: [5, 10, 20, 25, 100],
            currentPage: currentPage,
            headings: { id: checkAllInput, assigneeNames: "Assignee" },
            sortable: ['name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status', 'assigneeNames', 'customer_code'],
            columnsAlign: { id: 'center' },
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                if (!Array.isArray(res.data)) {
                    res.data = Object.values(res.data)
                }
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
                        {!selected ?
                        <div className="create" style={{width: '100%'}} >
                            <SelectSearch
                                search
                                onChange={(value, obj) => this.setStatusForMany(value, obj)}
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
                                placeholder="Set status for many"
                            />
                        </div>:
                        <div></div>}
                        {!selected ?
                            <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl filterFutureValue={filterFutureValue}
                                filterCompletedValue={filterCompletedValue} filterFutureAndIncomplete={true} loadAll={true} updateFilters={this.updateFilters}>
                                {
                                    function (row, column) {
                                        switch (column) {
                                            case 'id':
                                                return (
                                                    <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                        onChange={self.handleCheckboxTableChange}
                                                        checked={self.state.selectedMyTasks.includes(row.id.toString())} />
                                                );
                                            case 'status':
                                                return (
                                                    <div style={{
                                                        border: "2px solid #84ed80", padding: "0", backgroundColor: "#84ed80"
                                                    }} >
                                                        <SelectSearch
                                                            search
                                                            onChange={(value, obj) => self.handleUpdateStatus(value, obj, row.id)}
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
                                                            value={row.status}
                                                        />
                                                    </div>
                                                )
                                            case 'minutes':
                                                return (
                                                    <div style={{
                                                        border: "2px solid #84ed80", padding: "0", backgroundColor: "#84ed80"
                                                    }} >
                                                        <Form.Input
                                                            fluid
                                                            id="inlineMins"
                                                            name="minutes"
                                                            placeholder={row.minutes}
                                                            onFocus={()=>self.initializeInlineMinutes(row.minutes)}
                                                            onChange={self.handleInlineMinutesChange}
                                                            onBlur={()=>self.handleInlineMinutesUpdate(row.id)}
                                                            type="number"
                                                            min={0}
                                                        />
                                                    </div>
                                                )
                                            case 'actions':
                                                return (
                                                    <div onClick={() => self.handleEditClicked(row.id.toString(), this)}>
                                                        <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                            <AiFillEdit color="white" style={{ float: "left", marginTop: "4px" }} />
                                                            <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }} >
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
                            : ""}
                        <div>
                            <Form onSubmit={this.handleUpdate} size="small">
                                {selected ?
                                    <Grid className="app">
                                        <Header as="h1" icon color="blue" textAlign="center" style={{ marginTop: "20px" }}>
                                            Editing: {name}
                                        </Header>
                                        <Button.Group floated="right">
                                            <button className="btn btn-primary" style={{ marginRight: "8px", height: "35px" }} onClick={this.backToList}>
                                                <div style={{ color: "white" }} >
                                                    <span  >
                                                        Back
                                                    </span>
                                                </div>
                                            </button>
                                        </Button.Group>
                                        <Grid.Row>
                                            <Grid.Column width={6}>
                                                <Form.Field>
                                                    <label>Name</label>
                                                    <Form.Input
                                                        fluid
                                                        name="name"
                                                        value={name}
                                                        className={this.handleInputError(errors, "name")}
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
                                                    <label style={{ color: "green" }}>Notes</label>
                                                    <div style={{ border: "2px solid #84ed80", padding: "0", backgroundColor: "#84ed80" }}>
                                                        <TextArea
                                                            name="notes"
                                                            onChange={this.handleChange}
                                                            value={notes}
                                                            style={{ height: "190px" }}
                                                        />
                                                    </div>

                                                </Form.Field>
                                            </Grid.Column>
                                            <Grid.Column width={5}>
                                                {/* <Form.Field className={this.handleInputError(errors, "customer")}>
                                                    <label>Customer Code</label>
                                                    <SelectSearch
                                                        search
                                                        disabled
                                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "availableCustomerCodes")}
                                                        filterOptions={fuzzySearch}
                                                        options={availableCustomerCodes}
                                                        placeholder="Choose a customer code"
                                                        value={customerCode}
                                                    />
                                                </Form.Field> */}
                                                <Form.Field>
                                                    <label>Customer Code</label>
                                                    <Form.Input
                                                        fluid
                                                        name="customer"
                                                        value={customerCode}
                                                        className={this.handleInputError(errors, "customer")}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Customer Name</label>
                                                    <Form.Input
                                                        fluid
                                                        name="name"
                                                        value={customerName}
                                                        className={this.handleInputError(errors, "name")}
                                                    />
                                                </Form.Field>
                                                <Form.Field className={this.handleInputError(errors, "minutes")}>
                                                    <label style={{ color: "green" }}>Minutes</label>
                                                    <div style={{ border: "2px solid #84ed80", padding: "0", backgroundColor: "#84ed80" }}>
                                                        <Form.Input
                                                            fluid
                                                            name="minutes"
                                                            value={minutes}
                                                            className={this.handleInputError(errors, "minutes")}
                                                            onChange={this.handleChange}
                                                            type="number"
                                                            min={0}
                                                        />
                                                    </div>
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Remarks</label>
                                                    <TextArea
                                                        name="remark"
                                                        value={customerRemark}
                                                        style={{ height: "150px" }}
                                                    />
                                                </Form.Field>
                                            </Grid.Column>
                                            <Grid.Column width={5}>
                                                <Form.Field className={this.handleInputError(errors, "due")}>
                                                    <label>Due date</label>
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        // onChange={(date) => this.setDate(date)}
                                                        // onClick={() => { }}
                                                        dateFormat="MM-dd-yyyy"
                                                        closeOnScroll={(e) => e.target === document}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Repeat</label>
                                                    <Form.Input
                                                        fluid
                                                        name="repeat"
                                                        value={repeat}
                                                        className={this.handleInputError(errors, "repeat")}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Priority</label>
                                                    <Form.Input
                                                        fluid
                                                        name="priority"
                                                        value={priority}
                                                        className={this.handleInputError(errors, "priority")}
                                                    />
                                                </Form.Field>
                                                <Form.Field className={this.handleInputError(errors, "status")}>
                                                    <label style={{ color: "green" }}>Status</label>
                                                    <div style={{ border: "2px solid #84ed80", padding: "0", backgroundColor: "#84ed80" }}>
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
                                                    </div>
                                                </Form.Field>

                                                <Form.Field>
                                                    <label>Asignee(s)</label>
                                                    <Form.Input
                                                        fluid
                                                        name="asignee"
                                                        value={initialAssignees}
                                                        className={this.handleInputError(errors, "asignee")}
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
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column width={16}>
                                                <CredentialIndex
                                                    editable={false}
                                                    handleCredentialsChange={() => { }}
                                                    credentials={credentials} />
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid> :
                                    <Header as="h1" icon color="blue" textAlign="center" style={{ marginTop: "20px" }}>
                                        Select a task to edit
                                    </Header>}
                            </Form>
                            {errors.length > 0 && (
                                <Message error>
                                    <h3>Error</h3>
                                    {this.displayErrors(errors)}
                                </Message>
                            )}
                        </div>
                    </div>}
            </div>
        );
    }
}

export default MyTaskIndex;