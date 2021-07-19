import React, { Component } from 'react';
import { AiOutlineRead } from "react-icons/ai";

class ReadPage extends Component {
    state = {
        name: "",
        description: "",
        errors: [],
    }

    async componentDidMount() {
        console.log(this.props.match.params.id);
        console.log(typeof (this.props.match.params.id));
        const id = this.props.match.params.id;
        let res = await axios.get(`${process.env.MIX_API_URL}/announcements/${id}/edit`);
        this.setState({
            name: res.data.announcement.name,
            description: res.data.announcement.description,
        });

    }

    handleCancel = async () => {
        this.props.history.push("/announcements");
    }

    markReadOrUnread = async () => {
        const id = this.props.match.params.id;
        if (this.props.match.params.reading === "1") {
            const res = await axios.put(`${process.env.MIX_API_URL}/users/readAnnouncement/${id}`);
            if (res.data.status === 200) {
                this.props.history.push("/announcements");
            }
        } else {
            const res = await axios.put(`${process.env.MIX_API_URL}/users/unreadAnnouncement/${id}`);
            if (res.data.status === 200) {
                this.props.history.push("/announcements");
            }
        }

    }

    render() {
        const { name, description } = this.state;
        return (
            <div style={{
                width: "80%"
            }}>
                <h1>
                    Name: {name}
                </h1>
                <div style={{
                    border: "1px solid #e7e4e4",
                    backgroundColor: "#f9fbfc"
                }}>
                    <h4>
                        Description:
                    </h4>
                    <div dangerouslySetInnerHTML={{ __html: `${description}` }} />
                </div>
                <div style={{
                    width: "50%",
                    justifyContent: "start",
                    marginTop: "15px"
                }}>
                    <button className="btn btn-primary delete" onClick={() => { this.handleCancel() }} style={{ marginRight: "5px" }}>
                        <div style={{ color: "white" }} >
                            <span style={{ marginLeft: "8px" }} >
                                Cancel
                            </span>
                        </div>
                    </button>
                    <button className="btn btn-success delete" onClick={() => { this.markReadOrUnread() }}>
                        <div style={{ color: "white" }} >
                            <AiOutlineRead color="white" />
                            <span style={{ marginLeft: "8px" }} >
                                {this.props.match.params.reading === "1" ? "Mark as read" : "Mark as unread"}
                            </span>
                        </div>
                    </button>
                </div>
            </div >

        )
    }
}

export default ReadPage;