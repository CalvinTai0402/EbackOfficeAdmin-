import React from 'react';
import {
    Table,
    Form,
} from 'semantic-ui-react'
import { AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";

class CredentialIndex extends React.Component {
    state = {
        // rows: [{ "index": 0 }]
    };

    render() {
        const { rows } = this.state;
        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Entity Name</Table.HeaderCell>
                        <Table.HeaderCell>Login URL</Table.HeaderCell>
                        <Table.HeaderCell>Username</Table.HeaderCell>
                        <Table.HeaderCell>Password</Table.HeaderCell>
                        <Table.HeaderCell>Remarks</Table.HeaderCell>
                        <Table.HeaderCell>
                            <button className="btn btn-primary" style={{ marginLeft: "5px" }} onClick={this.props.addRow}>
                                <AiFillPlusSquare color="white" />
                                <div style={{ color: "white" }}>
                                    Add row
                                </div>
                            </button>
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
                                <Table.Cell>
                                    <Form.Field>
                                        <Form.Input
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
                                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={(event) => this.props.deleteRow(event, index)}>
                                        <AiFillMinusSquare color="white" />
                                        <div style={{ color: "white" }}>
                                            Delete row
                                        </div>
                                    </button>
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        );
    }
}

export default CredentialIndex;