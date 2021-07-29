import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiFillEdit, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";
import swal from 'sweetalert'

import '../../../css/TaskList.css';
import { indexOf } from 'lodash';
class TaskListIndex extends React.Component {
    state = {
        selectedTaskLists: [],
        taskListsIDs: [],
        isAllChecked: false,
        deleting: false,
    };

    async componentDidMount() {
        let pageSelect = document.getElementsByTagName("select")[0];
        pageSelect.value = this.props.perPage;
    }

    sleep = async (msec) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    check_all = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedTaskLists = this.state.selectedTaskLists.slice();

        selectedTaskLists.includes(value) ?
            selectedTaskLists.splice(selectedTaskLists.indexOf(value), 1) :
            selectedTaskLists.push(value);

        this.setState({ selectedTaskLists: selectedTaskLists }, () => {
            this.check_all.current.checked = _.difference(this.state.taskListsIDs, this.state.selectedTaskLists).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedTaskLists: [...new Set(this.state.selectedTaskLists.concat(this.state.taskListsIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.taskListsIDs, this.state.selectedTaskLists).length === 0;
        });
    }

    handleDelete = async (id) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you won't be able to recover the data.",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const res = await axios.delete(`${process.env.MIX_API_URL}/taskLists/${id}`);
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    };

    handleDeleteMany = async () => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you won't be able to recover the data.",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const { selectedTaskLists } = this.state
                let selectedTaskListIds = selectedTaskLists.map(Number);
                const res = await axios.post(`${process.env.MIX_API_URL}/taskLists/deleteMany`, {
                    selectedTaskListIds: selectedTaskListIds
                });
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    }

    render() {
        const { deleting } = this.state;
        let self = this;
        // const urlParams = new URLSearchParams(window.location.search);
        // const page = urlParams.get('page')
        // const perPage = urlParams.get('limit')
        const url = `${process.env.MIX_API_URL}/taskLists`;
        const columns = ['id', 'name', 'customer_code', 'duedate', 'priority', 'status', 'assigneeNames', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: this.props.perPage,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput, assigneeNames: "Assignee" },
            sortable: ['name', 'description', 'duedate', 'priority', 'status', 'assigneeNames',],
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let taskListsIDs = res.data.map(a => a.id.toString());
                self.setState({ taskListsIDs: taskListsIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.taskListsIDs, self.state.selectedTaskLists).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: 'Task Lists  '
            },
        };
        return (
            <div>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='list' circular />
                    <Header.Content>Task Lists</Header.Content>
                </Header>
                <button className="btn btn-primary create" style={{ marginRight: "8px" }}>
                    <Link to={'taskLists/create'}>
                        <div style={{ color: "white" }} >
                            <AiFillPlusSquare color="white" size="20" style={{ marginBottom: "2px" }} />
                            <span style={{ marginLeft: "8px" }} >
                                Create
                            </span>
                        </div>
                    </Link>
                </button>
                <button className="btn btn-danger delete" onClick={() => { self.handleDeleteMany() }}>
                    <div style={{ color: "white" }} >
                        <AiFillMinusSquare color="white" size="20" style={{ marginBottom: "2px" }} />
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
                                                    checked={self.state.selectedTaskLists.includes(row.id.toString())} />
                                            );
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }}>
                                                    <button className="btn btn-primary" style={{ marginRight: "5px" }} onClick={this.populateLinks}>
                                                        <Link to={`/taskLists/${row.id}/edit`}>
                                                            <AiFillEdit color="white" style={{ float: "left", marginTop: "4px" }} />
                                                            <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }} >
                                                                Edit
                                                            </div>
                                                        </Link>
                                                    </button>
                                                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { self.handleDelete(row.id) }}>
                                                        <AiFillDelete color="white" style={{ float: "left", marginTop: "4px" }} />
                                                        <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }}>
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

export default TaskListIndex;