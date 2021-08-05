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
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";

import "react-datepicker/dist/react-datepicker.css";

class UserEdit extends Component {
    state = {
        name: "",
        email: "",
        role: "",
        errors: [],
        loading: false,
    }

    async componentDidMount() {
        const id = this.props.match.params.id;
        let res = await axios.get(`${process.env.MIX_API_URL}/users/${id}/edit`);
        this.setState({
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
        });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { name, email, role } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`${process.env.MIX_API_URL}/users/${id}`, {
                name: name,
                email: email,
                role: role,
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
                this.props.history.push(`/users?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, email, role }) => {
        if (name && email && role) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (email.length === 0) {
                errors.push("Email cannot be empty")
            }
            if (role.length === 0) {
                errors.push("Role cannot be empty")
            }
            this.setState({ errors })
        });
    };

    redirectBack = (event) => {
        event.preventDefault()
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        this.props.history.push(`/users?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
    }

    handleSelectChange = (value, obj, field) => {
        switch (field) {
            case "role":
                this.setState({ role: obj.value })
                break;
            default:
        }
    }

    render() {
        const { name, email, role, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="user" color="blue" />
                            Edit User
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
                                    <label>Email</label>
                                    <Form.Input
                                        fluid
                                        name="email"
                                        onChange={this.handleChange}
                                        value={email}
                                        className={this.handleInputError(errors, "email")}
                                        type="email"
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "role")}>
                                    <label>Role</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.handleSelectChange(value, obj, "role")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'admin', name: 'admin' },
                                            { value: 'user', name: 'user' },
                                        ]}
                                        placeholder={"Choose a role"}
                                        value={role}
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

export default UserEdit;