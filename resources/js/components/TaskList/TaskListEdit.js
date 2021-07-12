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

class TaskListEdit extends Component {
    state = {
        name: "",
        description: "",
        notes: "",
        duedate: "",
        repeat: "",
        priority: "",
        status: "",
        errors: [],
        loading: false
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, description, notes, duedate, repeat, priority, status } = this.state;
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

    async componentDidMount() {
        const id = this.props.match.params.id;
        const res = await axios.get(`/taskLists/${id}/edit`);
        console.log(res.data)
        this.setState({
            name: res.data.taskList.name,
            description: res.data.taskList.description,
            notes: res.data.taskList.notes,
            duedate: res.data.taskList.duedate,
            repeat: res.data.taskList.repeat,
            priority: res.data.taskList.priority,
            status: res.data.taskList.status,
        });
    }

    render() {
        const { name, description, notes, duedate, repeat, priority, status, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="tasks" color="blue" />
                            Edit Available Task
                        </Header>
                        <Form onSubmit={this.handleUpdate} size="large">
                            <Segment stacked>
                                <Form.Field>
                                    <label>Name</label>
                                    <Form.Input
                                        fluid
                                        name="name"
                                        onChange={this.handleChange}
                                        value={name}
                                        className={this.handleInputError(errors, "name")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Description</label>
                                    <Form.Input
                                        fluid
                                        name="description"
                                        onChange={this.handleChange}
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
                                <Form.Field>
                                    <label>Due date</label>
                                    <Form.Input
                                        fluid
                                        name="duedate"
                                        onChange={this.handleChange}
                                        value={duedate}
                                        className={this.handleInputError(errors, "due")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Repeat</label>
                                    <Form.Input
                                        fluid
                                        name="repeat"
                                        onChange={this.handleChange}
                                        value={repeat}
                                        className={this.handleInputError(errors, "repeat")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Priority</label>
                                    <Form.Input
                                        fluid
                                        name="priority"
                                        onChange={this.handleChange}
                                        value={priority}
                                        className={this.handleInputError(errors, "priority")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Status</label>
                                    <Form.Input
                                        fluid
                                        name="status"
                                        onChange={this.handleChange}
                                        value={status}
                                        className={this.handleInputError(errors, "status")}
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