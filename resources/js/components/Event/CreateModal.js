import React, { Component } from 'react';
import {
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
} from "semantic-ui-react";
import SelectSearch from 'react-select-search';
import fuzzySearch from "../fuzzySearch";

class CreateModal extends Component {
    state = {
        errors: [],
    }

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
    };

    isFormValid = ({ title, description, priority }) => {
        if (title && description && priority) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (title.length === 0) {
                errors.push("Title cannot be empty")
            }
            if (description.length === 0) {
                errors.push("Description cannot be empty")
            }
            if (priority.length === 0) {
                errors.push("Priority cannot be empty")
            }
            this.setState({ errors })
        });
    };



    handleSubmit = () => {
        if (this.isFormValid(this.props)) {
            this.props.closeModal()
        }
    }

    render() {
        const { title, description } = this.props;
        const { errors } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            Create Event
                        </Header>
                        <Form onSubmit={this.handleSubmit} size="large" autoComplete="off">
                            <Segment stacked>
                                <Form.Field>
                                    <label>Title</label>
                                    <Form.Input
                                        fluid
                                        name="title"
                                        value={title}
                                        onChange={this.props.handleChange}
                                        className={this.handleInputError(errors, "title")}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Description</label>
                                    <Form.Input
                                        fluid
                                        name="description"
                                        value={description}
                                        onChange={this.props.handleChange}
                                        className={this.handleInputError(errors, "description")}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "priority")}>
                                    <label>Priority</label>
                                    <SelectSearch
                                        search
                                        onChange={(value, obj) => this.props.handleSelectChange(value, obj, "priority")}
                                        filterOptions={fuzzySearch}
                                        options={[
                                            { value: 'High', name: 'High' },
                                            { value: 'Medium', name: 'Medium' },
                                            { value: 'Low', name: 'Low' },
                                        ]}
                                        placeholder="Choose a priority"
                                    />
                                </Form.Field>
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column width={8} >
                                            <Button
                                                color="blue"
                                                fluid
                                                size="large"
                                                style={{ marginLeft: "18px" }}
                                            >
                                                Create
                                            </Button>
                                        </Grid.Column>
                                        <Grid.Column width={8}>
                                            <Button
                                                color="blue"
                                                fluid
                                                size="large"
                                                onClick={this.props.closeModal}
                                            >
                                                Cancel
                                            </Button>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>


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

export default CreateModal;