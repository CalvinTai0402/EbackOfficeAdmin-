import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiOutlineRead, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";
import swal from 'sweetalert'

import '../../../css/Announcements.css';

class AnnouncementIndex extends React.Component {
    state = {
        selectedAnnouncements: [],
        announcementsIDs: [],
        isAllChecked: false,
        deleting: false,
        loading: false,
    };

    check_all = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedAnnouncements = this.state.selectedAnnouncements.slice();

        selectedAnnouncements.includes(value) ?
            selectedAnnouncements.splice(selectedAnnouncements.indexOf(value), 1) :
            selectedAnnouncements.push(value);

        this.setState({ selectedAnnouncements: selectedAnnouncements }, () => {
            this.check_all.current.checked = _.difference(this.state.announcementsIDs, this.state.selectedAnnouncements).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedAnnouncements: [...new Set(this.state.selectedAnnouncements.concat(this.state.announcementsIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.announcementsIDs, this.state.selectedAnnouncements).length === 0;
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
                const res = await axios.put(`${process.env.MIX_API_URL}/users/deleteAnnouncement/${id}`);
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
                const { selectedAnnouncements } = this.state
                let selectedAnnouncementIds = selectedAnnouncements.map(Number);
                const res = await axios.put(`${process.env.MIX_API_URL}/users/deleteAnnouncements`, {
                    selectedAnnouncementIds: selectedAnnouncementIds
                });
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    }

    render() {
        const { deleting, loading } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/announcements`;
        const columns = ['id', 'name', 'description', 'assignees', 'status', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 5,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput },
            sortable: ['name', 'description', 'assignees', 'status'],
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let announcementsIDs = res.data.map(a => a.id.toString());
                self.setState({ announcementsIDs: announcementsIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.announcementsIDs, self.state.selectedAnnouncements).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: "Announcements"
            },
        };

        return (
            <div>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='calendar alternate' circular />
                    <Header.Content>Announcements</Header.Content>
                </Header>
                <button className="btn btn-primary create" style={{ marginRight: "8px" }}>
                    <Link to={'announcements/create'}>
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
                    deleting ? <Spinner /> : loading ? <Spinner text="loading" /> :
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl>
                            {
                                function (row, column) {
                                    let read = row["status"]
                                    switch (column) {
                                        case 'id':
                                            return (
                                                <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                    onChange={self.handleCheckboxTableChange}
                                                    checked={self.state.selectedAnnouncements.includes(row.id.toString())} />
                                            );
                                        case 'description':
                                            return (
                                                <div dangerouslySetInnerHTML={{ __html: `${row.description}` }} />
                                            )
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }}>
                                                    {read === "Read" ? <button className="btn btn-success" style={{ marginRight: "5px" }}>
                                                        <Link to={'announcements/' + row.id + '/edit/0/announcementIndex'}>
                                                            <AiOutlineRead color="white" />
                                                            <div style={{ color: "white" }} >
                                                                Unread
                                                            </div>
                                                        </Link>
                                                    </button> : <button className="btn btn-success" style={{ marginRight: "5px" }}>
                                                        <Link to={'announcements/' + row.id + '/edit/1/announcementIndex'}>
                                                            <AiOutlineRead color="white" />
                                                            <div style={{ color: "white" }} >
                                                                New
                                                            </div>
                                                        </Link>
                                                    </button>}
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

export default AnnouncementIndex;