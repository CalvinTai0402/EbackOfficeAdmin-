import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiFillEdit, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";

import '../../../css/Customer.css';
class CustomerIndex extends React.Component {
    state = {
        selectedCustomers: [],
        customersIDs: [],
        isAllChecked: false,
        deleting: false
    };

    check_all = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedCustomers = this.state.selectedCustomers.slice();

        selectedCustomers.includes(value) ?
            selectedCustomers.splice(selectedCustomers.indexOf(value), 1) :
            selectedCustomers.push(value);

        this.setState({ selectedCustomers: selectedCustomers }, () => {
            this.check_all.current.checked = _.difference(this.state.customersIDs, this.state.selectedCustomers).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedCustomers: [...new Set(this.state.selectedCustomers.concat(this.state.customersIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.customersIDs, this.state.selectedCustomers).length === 0;
        });
    }

    handleDelete = async (id) => {
        this.setState({ deleting: true })
        const res = await axios.delete(`${process.env.MIX_API_URL}/customers/${id}`);
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    };

    handleDeleteMany = async () => {
        this.setState({ deleting: true })
        const { selectedCustomers } = this.state
        let selectedCustomerIds = selectedCustomers.map(Number);
        const res = await axios.post(`${process.env.MIX_API_URL}/customers/deleteMany`, {
            selectedCustomerIds: selectedCustomerIds
        });
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    }

    render() {
        const { deleting } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/customers`;
        const columns = ['id', 'code', 'name', 'service', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 5,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput },
            sortable: ['code', 'name', 'service'],
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let customersIDs = res.data.map(a => a.id.toString());
                self.setState({ customersIDs: customersIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.customersIDs, self.state.selectedCustomers).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: 'Customers  '
            },
        };

        return (
            <div>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='address book' circular />
                    <Header.Content>Customers</Header.Content>
                </Header>
                <button className="btn btn-primary create" style={{ marginRight: "8px" }}>
                    <Link to={'customers/create'}>
                        <div style={{ color: "white" }} >
                            <AiFillPlusSquare color="white" size="20" />
                            <span style={{ marginLeft: "8px" }} >
                                Create
                            </span>
                        </div>
                    </Link>
                </button>
                <button className="btn btn-danger delete" onClick={() => { self.handleDeleteMany() }}>
                    <div style={{ color: "white" }} >
                        <AiFillMinusSquare color="white" size="20" />
                        <span style={{ marginLeft: "8px" }} >
                            Delete Many
                        </span>
                    </div>
                </button>
                {
                    deleting ? <Spinner /> :
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl>
                            {
                                function (row, column) {
                                    switch (column) {
                                        case 'id':
                                            return (
                                                <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                    onChange={self.handleCheckboxTableChange}
                                                    checked={self.state.selectedCustomers.includes(row.id.toString())} />
                                            );
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }}>
                                                    <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                        <Link to={'customers/' + row.id + '/edit'}>
                                                            <AiFillEdit color="white" />
                                                            <div style={{ color: "white" }} >
                                                                Edit
                                                            </div>
                                                        </Link>
                                                    </button>
                                                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { self.handleDelete(row.id) }}>
                                                        <AiFillDelete color="white" />
                                                        <div style={{ color: "white" }}>
                                                            Delete
                                                        </div>
                                                    </button>
                                                </div>

                                            );
                                        default:
                                            return (row[column]);
                                    }
                                }
                            }
                        </ServerTable >
                }</div>
        );
    }
}

export default CustomerIndex;