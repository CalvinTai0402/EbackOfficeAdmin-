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
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
class AnnouncementCreate extends Component {
    state = {
        name: "",
        description: "",
        asigneeIds: [],
        userNames: [],
        userIds: [],
        editorState: EditorState.createEmpty(),
        errors: [],
        loading: false
    }

    async componentDidMount() {
        await this.populateAvailableUsers()
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

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleEditorChange = (editorState) => {
        this.setState({ editorState }, () => {
            this.setState({
                description: draftToHtml(convertToRaw(editorState.getCurrentContent()))
            })
        });
    };

    uploadImageCallBack = async (file) => {
        let fileName = new Date(Date.now()).toISOString() + "_" + file.name
        fileName = fileName.replaceAll(":", "-")
        await this.uploadImage(fileName, file)
        let imagePath = `${process.env.MIX_BASE_URL}/storage/announcementImages/${fileName}`;
        return new Promise(
            (resolve, reject) => {
                resolve({ data: { link: imagePath } });
            }
        );
    }

    uploadImage = async (fileName, imageFile) => {
        const data = new FormData()
        data.append('fileName', fileName)
        data.append('imageFile', imageFile)
        this.setState({ loading: true });
        const res = await axios.post(`${process.env.MIX_API_URL}/announcements/saveImageFile`, data).catch((e) => {
            console.log(e);
        });
        if (res.data.status === 200) {
            this.setState({ loading: false });
        }
    }

    handleStore = async event => {
        event.preventDefault();
        const { name, description, asigneeIds } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const res = await axios.post(`${process.env.MIX_API_URL}/announcements`, {
                name: name,
                description: description,
                asigneeIds: asigneeIds
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
                this.props.history.push("/announcements");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error has-error" : "";
    };

    isFormValid = ({ name, description, asigneeIds }) => {
        if (name && description && asigneeIds.length != 0) { return true }
        this.setState({ errors: [] }, () => {
            const { errors } = this.state;
            if (name.length === 0) {
                errors.push("Name cannot be empty")
            }
            if (description.length === 0) {
                errors.push("Description cannot be empty")
            }
            if (asigneeIds.length === 0) {
                errors.push("Asignee cannot be empty")
            }
            this.setState({ errors })
        });
    };

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
        const { name, userNames, editorState, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ width: "80%" }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="file alternate" color="blue" />
                            Create Announcement
                        </Header>
                        <Form onSubmit={this.handleStore} size="large">
                            <Segment stacked>
                                <Form.Field className={this.handleInputError(errors, "name")}>
                                    <label>Name</label>
                                    <Form.Input
                                        fluid
                                        name="name"
                                        onChange={this.handleChange}
                                        value={name}

                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "description")}>
                                    <label>Description</label>
                                    <Editor
                                        editorStyle={{ height: "250px" }}
                                        editorState={editorState}
                                        wrapperClassName="demo-wrapper"
                                        editorClassName="editor-class"
                                        onEditorStateChange={this.handleEditorChange}
                                        toolbar={{
                                            image: {
                                                uploadCallback: this.uploadImageCallBack,
                                                previewImage: true,
                                                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                                            }
                                        }}
                                    />
                                </Form.Field>
                                <Form.Field className={this.handleInputError(errors, "asignee")}>
                                    <label>Announce to</label>
                                    <SelectSearch
                                        search
                                        filterOptions={fuzzySearch}
                                        closeOnSelect={false}
                                        printOptions="on-focus"
                                        multiple
                                        placeholder="Choose assignee(s)"
                                        onChange={(value, objArray) => this.handleMultipleSelectChange(value, objArray, "asignee")}
                                        options={userNames}
                                    />
                                </Form.Field>
                                <Button
                                    disabled={loading}
                                    className={loading ? "loading" : ""}
                                    color="blue"
                                    fluid
                                    size="large"
                                >
                                    Create Announcement
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

export default AnnouncementCreate;