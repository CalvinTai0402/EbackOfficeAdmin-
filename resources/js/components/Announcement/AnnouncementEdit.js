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
import { AiOutlineRead } from "react-icons/ai";

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
        source: "",
        canUpdate: false,
        errors: [],
        loading: false
    }

    async componentDidMount() {
        await this.populateAvailableUsers()
        await this.populateThisAnnouncementDetails()
        const id = this.props.match.params.id;
        let res = await axios.get(`${process.env.MIX_API_URL}/announcements/${id}/edit`);
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
            editorState: editorState,
            source: this.props.match.params.source,
            id: this.props.match.params.id
        });
        await this.setCanUpdate();
        await this.markRead()
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

    populateThisAnnouncementDetails = async () => {
        const id = this.props.match.params.id;
        let res = await axios.get(`${process.env.MIX_API_URL}/announcements/${id}/populateThisAnnouncementDetails`);
        let thisAnnouncementDetails = res.data.thisAnnouncementDetails;
        this.setState({ thisAnnouncementDetails });
    }

    setCanUpdate = async () => {
        const { thisAnnouncementDetails, source } = this.state;
        if (source === "sentAnnouncementIndex") {
            for (let thisAnnouncementDetail of thisAnnouncementDetails) {
                if (thisAnnouncementDetail[1] === 1) { return; }
            }
            this.setState({ canUpdate: true });
        }
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

    handleUpdate = async () => {
        // event.preventDefault();
        const { name, description, asigneeIds } = this.state;
        if (this.isFormValid(this.state)) {
            this.setState({ loading: true });
            const id = this.props.match.params.id;
            const res = await axios.put(`${process.env.MIX_API_URL}/announcements/${id}`, {
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
                const { limit, currentPage } = this.props.location;
                this.props.history.push(`/announcementssent?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`)
            }
        }
    };

    markRead = async () => {
        const { source, id } = this.state;
        if (source === "announcementIndex") { await axios.put(`${process.env.MIX_API_URL}/users/readAnnouncement/${id}`); }
    }

    markUnread = async () => {
        const { id } = this.state;
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        await axios.put(`${process.env.MIX_API_URL}/users/unreadAnnouncement/${id}`);
        this.props.history.push(`/announcements?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
    }

    cancel = () => {
        const { source } = this.state;
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        if (source === "sentAnnouncementIndex") {
            this.props.history.push(`/announcementssent?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
        }
        else {
            this.props.history.push(`/announcements?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
        }
    }

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
        const { name, userNames, initialAssignees, thisAnnouncementDetails, editorState, source, canUpdate, errors, loading } = this.state;
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <Grid.Column style={{ width: "80%" }}>
                        <Header as="h1" icon color="blue" textAlign="center">
                            <Icon name="tasks" color="blue" />
                            Reading Announcement
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
                                        value={initialAssignees}
                                    />
                                </Form.Field>
                                {canUpdate ?
                                    <Button
                                        disabled={loading}
                                        className={loading ? "loading" : ""}
                                        color="blue"
                                        fluid
                                        size="large"
                                    >
                                        Update
                                    </Button> : ""}
                                {source === "sentAnnouncementIndex" ?
                                    <Button
                                        className={loading ? "loading" : ""}
                                        color="green"
                                        fluid
                                        size="large"
                                        onClick={this.cancel}
                                        style={{ marginTop: "8px" }}>
                                        Back
                                    </Button> : ""}
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
                {source === "sentAnnouncementIndex" ? <div>
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
                    : source === "announcementIndex" ?
                        <Grid textAlign="center" verticalAlign="middle" className="app">
                            <Grid.Column style={{ width: "80%" }}>
                                <Button.Group floated="right">
                                    <button className="btn btn-primary" style={{ marginRight: "8px" }} onClick={this.cancel}>
                                        <div style={{ color: "white" }} >
                                            <span  >
                                                Cancel
                                            </span>
                                        </div>
                                    </button>
                                    <button className="btn btn-success" onClick={this.markUnread}>
                                        <div style={{ color: "white" }} >
                                            <AiOutlineRead color="white" style={{ marginBottom: "2px" }} />
                                            <span style={{ marginLeft: "8px" }} >
                                                Mark as Unread
                                            </span>
                                        </div>
                                    </button>
                                </Button.Group>
                            </Grid.Column>
                        </Grid> : ""}
            </div>
        );
    }
}

export default AnnouncementEdit;