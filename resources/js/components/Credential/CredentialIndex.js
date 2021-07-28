import React from 'react';
import {
    Table,
    Form,
} from 'semantic-ui-react'
import { AiFillPlusSquare } from "react-icons/ai";
class CredentialIndex extends React.Component {
    state = {
        // rows: [{ "index": 0 }]
    };

    render() {
        const { editable } = this.props;
        return (
            <div style={{ overflowX: "auto" }}>
                <Table celled >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Entity Name</Table.HeaderCell>
                            <Table.HeaderCell>Login URL</Table.HeaderCell>
                            <Table.HeaderCell>Username</Table.HeaderCell>
                            <Table.HeaderCell>Password</Table.HeaderCell>
                            <Table.HeaderCell>Remarks</Table.HeaderCell>
                            <Table.HeaderCell>
                                {editable ? <button className="btn btn-primary" style={{ marginLeft: "5px", minWidth: "100px" }} onClick={this.props.addRow}>
                                    <AiFillPlusSquare color="white" style={{ float: "left", marginTop: "4px" }} />
                                    <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }}>
                                        Add row
                                    </div>
                                </button> : ""}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.props.credentials.map((credential, index) => {
                            return (
                                <Table.Row key={index}>
                                    <Table.Cell>
                                        <Form.Field>
                                            <Form.Input
                                                value={credential[0]}
                                                onChange={(e) => this.props.handleCredentialsChange(e, "entityName", index)}
                                            />
                                        </Form.Field>
                                    </Table.Cell>
                                    <Table.Cell >
                                        <Form.Field >
                                            <Form.Input
                                                type="url"
                                                value={credential[1]}
                                                onChange={(e) => this.props.handleCredentialsChange(e, "loginUrl", index)}
                                            />
                                        </Form.Field>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Field>
                                            <Form.Input
                                                value={credential[2]}
                                                onChange={(e) => this.props.handleCredentialsChange(e, "username", index)}
                                            />
                                        </Form.Field>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Field>
                                            <Form.Input
                                                value={credential[3]}
                                                onChange={(e) => this.props.handleCredentialsChange(e, "password", index)}
                                            />
                                        </Form.Field>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Field>
                                            <Form.Input
                                                value={credential[4]}
                                                onChange={(e) => this.props.handleCredentialsChange(e, "remarks", index)}
                                            />
                                        </Form.Field>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {editable ? <button className="btn btn-danger" onClick={(event) => this.props.deleteRow(event, index)}>
                                            <div style={{ color: "white" }}>
                                                DEL
                                            </div>
                                        </button> : ""}
                                        <button className="btn btn-success" style={{ marginLeft: "5px" }}>
                                            <a target="_blank" href={credential[1]}>
                                                URL
                                            </a>
                                        </button>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}

export default CredentialIndex;