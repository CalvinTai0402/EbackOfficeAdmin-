import React, { Component } from 'react';
import {
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
    Icon,
    TextArea
} from "semantic-ui-react";

class AvailableTaskEdit extends Component {
    state = {
        name: "",
        description: "",
        errors: [],
        loading: false
    }

    async componentDidMount() {
        const id = this.props.match.params.id;
        const res = await axios.get(`${process.env.MIX_API_URL}/availableTasks/${id}/edit`);
        this.setState({ name: res.data.availableTask.name });
        this.setState({ description: res.data.availableTask.description });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async () => {
        // event.preventDefault();
        const { name, description } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`${process.env.MIX_API_URL}/availableTasks/${id}`, {
                name: name,
                description: description
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
                this.props.history.push(`/availableTasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, description }) => {
        if (name && description) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (description.length === 0) {
                errors.push("Description cannot be empty")
            }
            this.setState({ errors }) // the reason for this is to re-render
        });
    };


    redirectBack = (event) => {
        event.preventDefault()
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        this.props.history.push(`/availableTasks?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
    }

    render() {
        const { name, description, errors, loading } = this.state;
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
                                <Form.Field className={this.handleInputError(errors, "description")}>
                                    <label>Description</label>
                                    <TextArea
                                        name="description"
                                        onChange={this.handleChange}
                                        value={description}
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

export default AvailableTaskEdit;