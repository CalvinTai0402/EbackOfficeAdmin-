import React, { Component } from 'react';

class AuditEdit extends Component {
    state = {
        userID: "",
        username: "",
        event: "",
        modifiedItem: "",
        oldValues: "",
        newValues: "",
        errors: [],
        loading: false
    }

    async componentDidMount() {
        const id = this.props.match.params.id;
        const res = await axios.get(`${process.env.MIX_API_URL}/audits/${id}/edit`);
        console.log(res.data)
        this.setState({
            userID: res.data.audit.user_id,
            username: res.data.audit.username,
            event: res.data.audit.event,
            modifiedItem: res.data.audit.auditable_type,
            oldValues: res.data.audit.old_values,
            newValues: res.data.audit.new_values,
        });
    }

    redirectBack = (event) => {
        event.preventDefault()
        let { limit, currentPage } = this.props.location;
        if (limit == null) { limit = 20 }
        if (currentPage == null) { currentPage = 1 }
        this.props.history.push(`/audits?search=&limit=${limit}&page=${currentPage}&orderBy=&order=desc`);
    }

    render() {
        let { userID, username, event, modifiedItem, oldValues, newValues } = this.state;
        let oldValuesArray = [];
        let newValuesArray = [];
        if (!Array.isArray(oldValues)) { oldValuesArray = Object.entries(oldValues) }
        if (!Array.isArray(newValues)) { newValuesArray = Object.entries(newValues) }
        return (
            <div style={{ marginTop: "50px", width: "100%" }}>
                <button className="btn btn-primary" style={{ float: "right", marginBottom: "8px", height: "35px" }} onClick={this.redirectBack}>
                    <div style={{ color: "white" }} >
                        <span  >
                            Back
                        </span>
                    </div>
                </button>
                <table className="table auditDetails" style={{ maxWidth: "100%", width: "100%" }}>
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">User ID</th>
                            <th scope="col">Username</th>
                            <th scope="col">Event</th>
                            <th scope="col">Modified item</th>
                            <th scope="col">Old Values</th>
                            <th scope="col">New Values</th>
                        </tr>
                    </thead>
                    <tbody id="audits">
                        <tr>
                            <td>{userID}</td>
                            <td>{username}</td>
                            <td>{event}</td>
                            <td>{modifiedItem}</td>
                            <td style={{ maxWidth: "400px" }}>
                                {oldValuesArray.map((value, index) => (
                                    <tr key={index}>
                                        <b><td style={{ maxWidth: "100px", overflowWrap: "break-word" }} > {value[0]}</td></b>
                                        <td style={{ maxWidth: "300px", overflowWrap: "break-word" }}>{value[1]}</td>
                                    </tr>
                                ))}
                            </td>
                            <td style={{ maxWidth: "400px" }}>
                                {newValuesArray.map((value, index) => (
                                    <tr key={index}>
                                        <b><td style={{ maxWidth: "100px", overflowWrap: "break-word" }}> {value[0]}</td></b>
                                        <td style={{ maxWidth: "300px", overflowWrap: "break-word" }}>{value[1]}</td>
                                    </tr>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        );
    }
}

export default AuditEdit;