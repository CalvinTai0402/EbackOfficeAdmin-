import React from 'react';
import ServerTable from '../ServerTable';
import { AiFillDelete, AiFillEdit, AiOutlineRead, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";
import swal from 'sweetalert'

import '../../../css/SentAnnouncements.css';

class SentAnnouncementsIndex extends React.Component {
    state = {
        selectedSentAnnouncements: [],
        sentAnnouncementsIDs: [],
        isAllChecked: false,
        deleting: false,
        loading: false,
        currentPage: 1,
        limit: this.props.perPage,
    };

    async componentDidMount() {
        await this.goToPage()
        await this.setDropDownValue()
    }

    goToPage = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let i = 0;
        while (this.state.sentAnnouncementsIDs.length <= 0 && i < 100) {
            await this.sleep(1000);
            i += 1;
        }
        const paginationLinks = document.getElementsByClassName("page-link");
        paginationLinks[urlParams.get('page')].click()
    }

    sleep = async (msec) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    setDropDownValue = async () => {
        let pageSelect = document.getElementsByTagName("select")[0];
        const urlParams = new URLSearchParams(window.location.search);
        pageSelect.value = urlParams.get('limit');
    }

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
        swal({
            title: "Are you sure?",
            text: "Once unsent, no one can see the announcement anymore.",
            icon: "warning",
            buttons: ["Cancel", "Unsend"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const res = await axios.delete(`${process.env.MIX_API_URL}/announcements/${id}`);
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    };

    handleManyUnsendToAll = async () => {
        swal({
            title: "Are you sure?",
            text: "Once unsent, no one can see the announcement anymore.",
            icon: "warning",
            buttons: ["Cancel", "Unsend"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const { selectedSentAnnouncements } = this.state
                let selectedSentAnnouncementIds = selectedSentAnnouncements.map(Number);
                const res = await axios.post(`${process.env.MIX_API_URL}/announcements/deleteMany`, {
                    selectedSentAnnouncementIds: selectedSentAnnouncementIds
                });
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    }

    render() {
        let { deleting, loading, currentPage, limit } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/announcements/getSentAnnouncements`;
        const columns = ['id', 'name', 'description', 'assignees', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('limit')) { limit = urlParams.get('limit') }
        if (urlParams.get('page')) { currentPage = urlParams.get('page') }
        const options = {
            perPage: limit,
            perPageValues: [5, 10, 20, 25, 100],
            currentPage: currentPage,
            headings: { id: checkAllInput, created_at: 'Created At' },
            sortable: ['name', 'description', 'assignees'],
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
                <Header as='h2' icon textAlign='center'>
                    <Icon name='calendar alternate outline' circular />
                    <Header.Content>Sent Announcements</Header.Content>
                </Header>
                <button className="btn btn-danger" onClick={() => { self.handleManyUnsendToAll() }} style={{ marginBottom: "15px" }}>
                    <div style={{ color: "white" }} >
                        <AiFillMinusSquare color="white" size="20" style={{ marginBottom: "2px" }} />
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
                                    const editPathProps = {
                                        pathname: 'announcements/' + row.id + '/edit/sentAnnouncementIndex',
                                        limit: limit,
                                        currentPage: currentPage,
                                    };
                                    switch (column) {
                                        case 'id':
                                            return (
                                                <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                    onChange={self.handleCheckboxTableChange}
                                                    checked={self.state.selectedSentAnnouncements.includes(row.id.toString())} />
                                            );
                                        case 'description':
                                            return (
                                                <div dangerouslySetInnerHTML={{ __html: `${row.description}` }} />
                                            )
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }}>
                                                    <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                        <Link to={editPathProps}>
                                                            <AiFillEdit color="white" style={{ float: "left", marginTop: "4px" }} />
                                                            <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }} >
                                                                Edit
                                                            </div>
                                                        </Link>
                                                    </button>
                                                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { self.handleUnsendToAll(row.id) }}>
                                                        <AiFillDelete color="white" style={{ float: "left", marginTop: "4px" }} />
                                                        <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }}>
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