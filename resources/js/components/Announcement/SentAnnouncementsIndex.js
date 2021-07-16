import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiFillEdit, AiOutlineRead, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
} from "semantic-ui-react";

class SentAnnouncementsIndex extends React.Component {
    state = {
        selectedSentAnnouncements: [],
        sentAnnouncementsIDs: [],
        isAllChecked: false,
        deleting: false,
        loading: false,
    };

    check_all = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedSentAnnouncements = this.state.selectedSentAnnouncements.slice();

        selectedSentAnnouncements.includes(value) ?
            selectedSentAnnouncements.splice(selectedSentAnnouncements.indexOf(value), 1) :
            selectedSentAnnouncements.push(value);

        this.setState({ selectedSentAnnouncements: selectedSentAnnouncements }, () => {
            this.check_all.current.checked = _.difference(this.state.sentAnnouncementsIDs, this.state.selectedSentAnnouncements).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedSentAnnouncements: [...new Set(this.state.selectedSentAnnouncements.concat(this.state.sentAnnouncementsIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.aentAnnouncementsIDs, this.state.selectedSentAnnouncements).length === 0;
        });
    }

    handleUnsendToAll = async (id) => {
        this.setState({ deleting: true })
        const res = await axios.delete(`/announcements/${id}`);
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    };

    handleManyUnsendToAll = async () => {
        this.setState({ deleting: true })
        const { selectedSentAnnouncements } = this.state
        let selectedSentAnnouncementIds = selectedSentAnnouncements.map(Number);
        const res = await axios.post(`/announcements/deleteMany`, {
            selectedSentAnnouncementIds: selectedSentAnnouncementIds
        });
        if (res.data.status === 200) {
            this.setState({ deleting: false })
        }
    }

    render() {
        const { deleting, loading } = this.state;
        let self = this;
        const url = 'http://localhost:8000/announcements/getSentAnnouncements';
        const columns = ['id', 'name', 'description', 'assignees', 'created_at', 'updated_at', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const options = {
            perPage: 5,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput, created_at: 'Created At' },
            sortable: ['name', 'description', 'assignees'],
            columnsWidth: { name: 20, description: 20, id: 5 },
            columnsAlign: { id: 'center' },
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let sentAnnouncementsIDs = res.data.map(a => a.id.toString());
                self.setState({ sentAnnouncementsIDs: sentAnnouncementsIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.sentAnnouncementsIDs, self.state.selectedSentAnnouncements).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: "My Sent Announcements"
            },
        };

        return (
            <div>
                <button className="btn btn-danger" onClick={() => { self.handleManyUnsendToAll() }} style={{ marginBottom: "15px" }}>
                    <div style={{ color: "white" }} >
                        <AiFillMinusSquare color="white" size="20" />
                        <span style={{ marginLeft: "8px" }} >
                            Unsend Many Announcements to All
                        </span>
                    </div>
                </button>
                {
                    deleting ? <Spinner text="Unsending" /> : loading ? <Spinner text="loading" /> :
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl>
                            {
                                function (row, column) {
                                    switch (column) {
                                        case 'id':
                                            return (
                                                <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                    onChange={self.handleCheckboxTableChange}
                                                    checked={self.state.selectedSentAnnouncements.includes(row.id.toString())} />
                                            );
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <button className="btn btn-danger" style={{ marginRight: "5px" }}>
                                                        <Link to={'announcements/' + row.id + '/edit'}>
                                                            <AiFillDelete color="white" />
                                                            <div style={{ color: "white" }} >
                                                                Unsend to some
                                                            </div>
                                                        </Link>
                                                    </button>
                                                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { self.handleUnsendToAll(row.id) }}>
                                                        <AiFillDelete color="white" />
                                                        <div style={{ color: "white" }}>
                                                            Unsend to all
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

export default SentAnnouncementsIndex;