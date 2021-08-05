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

class UserChangePassword extends Component {
    state = {
        loggedInUserId: -1,
        loggedInUserName: "",
        oldPassword: "",
        newPassword: "",
        errors: [],
        loading: false,
    }

    async componentDidMount() {
        const res = await axios.get("/getLoggedInUsername")
        this.setState({
            loggedInUserId: res.data.loggedInUserId,
            loggedInUserName: res.data.loggedInUserName
        })
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleUpdate = async (event) => {
        event.preventDefault();
        const { loggedInUserId, oldPassword, newPassword } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.put(`${process.env.MIX_API_URL}/users/${loggedInUserId}/changePassword`, {
                oldPassword: oldPassword,
                newPassword: newPassword,
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
                this.props.history.goBack();
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ oldPassword, newPassword }) => {
        if (oldPassword && newPassword) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (oldPassword.length === 0) {
                errors.push("Old Password cannot be empty")
            }
            if (newPassword.length === 0) {
                errors.push("New password cannot be empty")
            }
            this.setState({ errors })
        });
    };

    redirectBack = (event) => {
        event.preventDefault()
        this.props.history.goBack();
    }

    render() {
        const { loggedInUserName, oldPassword, newPassword, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="user" color="blue" />
                            Editing: {loggedInUserName}
                        </Header>
                        <Form onSubmit={this.handleUpdate} size="large">
                            <Segment stacked>
                                <Form.Field>
                                    <label>Old Password</label>
                                    <Form.Input
                                        fluid
                                        name="oldPassword"
                                        onChange={this.handleChange}
                                        value={oldPassword}
                                        className={this.handleInputError(errors, "old")}
                                        type="password"
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>New Password</label>
                                    <Form.Input
                                        fluid
                                        name="newPassword"
                                        onChange={this.handleChange}
                                        value={newPassword}
                                        className={this.handleInputError(errors, "new")}
                                        type="password"
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

export default UserChangePassword;