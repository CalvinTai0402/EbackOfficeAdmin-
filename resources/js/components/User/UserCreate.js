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

class UserCreate extends Component {
    state = {
        name: "",
        email: "",
        password: "",
        role: "",
        errors: [],
        loading: false,
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleStore = async event => {
        event.preventDefault();
        const { name, email, password, role } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.post(`${process.env.MIX_API_URL}/users`, {
                name: name,
                email: email,
                password: password,
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
                this.props.history.push("/users");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ name, email, password, role }) => {
        if (name && email && password && role) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (email.length === 0) {
                errors.push("Email cannot be empty")
            }
            if (password.length === 0) {
                errors.push("Password cannot be empty")
            }
            if (role.length === 0) {
                errors.push("Role cannot be empty")
            }
            this.setState({ errors })
        });
    };

    handleSelectChange = (value, obj, field) => {
        switch (field) {
            case "role":
                this.setState({ role: obj.value })
                break;
            default:
        }
    }

    render() {
        const { name, email, password, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="user" color="blue" />
                            Create User
                        </Header>
                        <Form onSubmit={this.handleStore} size="large" autoComplete="off">
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
                                <Form.Field>
                                    <label>Password</label>
                                    <Form.Input
                                        fluid
                                        name="password"
                                        onChange={this.handleChange}
                                        value={password}
                                        className={this.handleInputError(errors, "password")}
                                        type="password"
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
                                        placeholder="Choose a role"
                                    />
                                </Form.Field>
                                <Button
                                    disabled={loading}
                                    className={loading ? "loading" : ""}
                                    color="blue"
                                    fluid
                                    size="large"
                                >
                                    Create User
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

export default UserCreate;