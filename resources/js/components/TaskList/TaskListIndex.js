import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiFillEdit, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";

class TaskListIndex extends React.Component {
    state = {
        selectedTaskLists: [],
        TaskListsIDs: [],
        isAllChecked: false,
        deleting: false
    };

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
        this.setState({ deleting: true })
        const res = await axios.delete(`/taskLists/${id}`);
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    };

    handleDeleteMany = async () => {
        this.setState({ deleting: true })
        const { selectedTaskLists } = this.state
        let selectedTaskListIds = selectedTaskLists.map(Number);
        const res = await axios.post(`/taskLists/deleteMany`, {
            selectedTaskListIds: selectedTaskListIds
        });
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    }

    render() {
        const { deleting } = this.state;
        let self = this;
        const url = 'http://localhost:8000/taskLists';
        const columns = ['id', 'name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status', 'created_at', 'updated_at', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 10,
            headings: { id: checkAllInput, created_at: 'Created At' },
            sortable: ['name', 'description', 'notes', 'duedate', 'repeat', 'priority', 'status'],
            columnsWidth: { name: 20, description: 20, id: 5 },
            columnsAlign: { id: 'center' },
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
                <button className="btn btn-primary create" style={{ marginRight: "8px" }}>
                    <Link to={'taskLists/create'}>
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
                                                    checked={self.state.selectedTaskLists.includes(row.id.toString())} />
                                            );
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                        <Link to={'taskLists/' + row.id + '/edit'}>
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

export default TaskListIndex;