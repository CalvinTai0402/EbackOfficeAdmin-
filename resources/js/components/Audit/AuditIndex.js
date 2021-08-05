import React from 'react';
import ServerTable from '../ServerTable';
import { AiFillEdit } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";

import '../../../css/Audit.css';
class AuditIndex extends React.Component {
    state = {
        selectedAvailableTasks: [],
        auditsIDs: [],
        isAllChecked: false,
        deleting: false,
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
        while (this.state.auditsIDs.length <= 0 && i < 100) {
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

    // handleCheckboxTableChange = (event) => {
    //     const value = event.target.value;
    //     let selectedAvailableTasks = this.state.selectedAvailableTasks.slice();

    //     selectedAvailableTasks.includes(value) ?
    //         selectedAvailableTasks.splice(selectedAvailableTasks.indexOf(value), 1) :
    //         selectedAvailableTasks.push(value);

    //     this.setState({ selectedAvailableTasks: selectedAvailableTasks }, () => {
    //         this.check_all.current.checked = _.difference(this.state.availableTasksIDs, this.state.selectedAvailableTasks).length === 0;
    //     });
    // }

    // handleCheckboxTableAllChange = (event) => {
    //     this.setState({ selectedAvailableTasks: [...new Set(this.state.selectedAvailableTasks.concat(this.state.availableTasksIDs))] }, () => {
    //         this.check_all.current.checked = _.difference(this.state.availableTasksIDs, this.state.selectedAvailableTasks).length === 0;
    //     });
    // }


    render() {
        let { deleting, currentPage, limit } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/audits`;
        const columns = ['user_id', 'username', 'event', 'auditable_type', 'old_values', 'new_values', 'actions']
        // let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('limit')) { limit = urlParams.get('limit') }
        if (urlParams.get('page')) { currentPage = urlParams.get('page') }
        const options = {
            perPage: limit,
            perPageValues: [5, 10, 20, 25, 100],
            currentPage: currentPage,
            headings: { user_id: "User ID", auditable_type: "Modified item", old_values: "Old values", new_values: "New values" },
            sortable: ['user_id', 'username', 'event', 'auditable_type', 'old_values', 'new_values', 'actions'],
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let auditsIDs = res.data.map(a => a.id.toString());
                self.setState({ auditsIDs: auditsIDs });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: 'Audit  '
            },
        };

        return (
            <div>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='list ul' circular />
                    <Header.Content>Audit</Header.Content>
                </Header>
                {
                    deleting ? <Spinner /> :
                        <ServerTable columns={columns} url={url} options={options} bordered hover updateUrl>
                            {
                                function (row, column) {
                                    const editPathProps = {
                                        pathname: 'audits/' + row.id + '/edit',
                                        limit: limit,
                                        currentPage: currentPage,
                                    };
                                    switch (column) {
                                        case 'actions':
                                            return (
                                                <div style={{ display: "flex", justifyContent: "start" }}>
                                                    <button className="btn btn-success" style={{ marginRight: "5px" }}>
                                                        <Link to={editPathProps}>
                                                            <AiFillEdit color="white" style={{ float: "left", marginTop: "4px" }} />
                                                            <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }} >
                                                                Details
                                                            </div>
                                                        </Link>
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

export default AuditIndex;