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
} from "semantic-ui-react";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";

class MyTaskIndex extends React.Component {
    state = {
        selectedMyTasks: [],
        myTasksIDs: [],
        isAllChecked: false,
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
        rowId: "",
        errors: [],
        loading: false
    };

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
        res = await axios.get(`/taskLists/${id}/edit`);
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
            rowId: id,
            availableTaskNames: availableTaskNames,
            availableTaskDescriptions: availableTaskDescriptions
        });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status, rowId } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.put(`/taskLists/${rowId}`, {
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
                // this.forceUpdate()
                this.props.history.push("/myTasks");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, description, duedate, repeat, priority, status }) => {
        if (name && description) { return true }
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
            case "availableTaskName":
                this.setState({ name: obj.name })
                this.setState({ description: availableTaskDescriptions[obj.index].name })
            default:
        }
    }

    render() {
        const { name, description, notes, selectedDate, repeat, priority, status, availableTaskNames, errors, loading } = this.state;
        let self = this;
        const url = 'http://localhost:8000/myTasks';
        const columns = ['id', 'name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status', 'created_at', 'updated_at', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 5,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput, created_at: 'Created At' },
            sortable: ['name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status'],
            columnsWidth: { name: 20, description: 20, id: 5 },
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
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl>
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
                                                <div style={{ display: "flex", justifyContent: "space-between" }} onClick={() => self.handleEditClicked(row.id.toString())}>
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
                                    <Header as="h1" icon color="blue" textAlign="center" >
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
                    </div>}
            </div>
        );
    }
}

export default MyTaskIndex;