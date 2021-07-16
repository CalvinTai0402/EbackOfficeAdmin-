import React, { Component } from 'react';
import { Table } from 'reactstrap';
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
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
class AnnouncementEdit extends Component {
    state = {
        name: "",
        description: "",
        asigneeIds: [],
        initialAssignees: [],
        userNames: [],
        userIds: [],
        thisAnnouncementDetails: [],
        editorState: EditorState.createEmpty(),
        errors: [],
        loading: false
    }

    async componentDidMount() {
        await this.populateAvailableUsers()
        await this.populateThisAnnouncementDetails()
        const id = this.props.match.params.id;
        let res = await axios.get(`/announcements/${id}/edit`);
        const contentBlock = htmlToDraft(res.data.announcement.description);
        let editorState = EditorState.createEmpty();
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            editorState = EditorState.createWithContent(contentState);
        }
        this.setState({
            name: res.data.announcement.name,
            description: res.data.announcement.description,
            asigneeIds: res.data.announcement.asigneeIds,
            initialAssignees: res.data.announcement.initialAssignees,
            editorState: editorState
        });

    }

    populateAvailableUsers = async () => {
        let res = await axios.get(`/users/populateUsersForTaskList`);
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

    populateThisAnnouncementDetails = async () => {
        const id = this.props.match.params.id;
        let res = await axios.get(`/announcements/${id}/populateThisAnnouncementDetails`);
        this.setState({
            thisAnnouncementDetails: res.data.thisAnnouncementDetails
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
        let imagePath = 'http://localhost:8000/announcementImages/' + fileName;
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
        const res = await axios.post('/announcements/saveImageFile', data).catch((e) => {
            console.log(e);
        });
        if (res.data.status === 200) {
            this.setState({ loading: false });
        }
    }

    handleUpdate = async () => {
        // event.preventDefault();
        const { name, description, asigneeIds } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`/announcements/${id}`, {
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
                this.props.history.push("/announcementsunread");
            }
        }
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error}</p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.toLowerCase().includes(inputName)) ? "error" : "";
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
        const { name, userNames, initialAssignees, thisAnnouncementDetails, editorState, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ width: "80%" }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="tasks" color="blue" />
                            Edit Announcement
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
                                    <Editor
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
                        )}
                    </Grid.Column>
                </Grid>
                <Table style={{ marginTop: "30px" }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Sent to</th>
                            <th>Read</th>
                            <th>Deleted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {thisAnnouncementDetails.map((thisAnnouncementDetail, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{thisAnnouncementDetail[0]}</td>
                                    <td>{thisAnnouncementDetail[1] === 0 ? "No" : "Yes"}</td>
                                    <td>{thisAnnouncementDetail[2] === 0 ? "No" : "Yes"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default AnnouncementEdit;