import React from 'react'
import FullCalendar, { formatDate } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ReactModal from 'react-modal';
import Spinner from '../Spinner'
import CreateModal from './CreateModal'
import EditModal from './EditModal'
import swal from 'sweetalert'

import '../../../css/App.css'
import axios from 'axios'

class Event extends React.Component {
    state = {
        weekendsVisible: true,
        currentEvents: [],
        events: [],
        loading: false,
        showModal: false,
        showEditModal: false,
        title: "",
        description: "",
        priority: "",
        editTitle: "",
        editDescription: "",
        editPriority: "",
        edited: false,
    }

    async componentDidMount() {
        await this.getEvents();
    }

    getEvents = async () => {
        this.setState({ loading: true })
        const res = await axios.get(`${process.env.MIX_API_URL}/events`);
        if (res.data.status == 200) {
            this.setState({
                loading: false,
                events: res.data.events
            })
        }
    }

    handleWeekendsToggle = () => {
        this.setState({
            weekendsVisible: !this.state.weekendsVisible
        })
    }

    handleDateSelect = async (selectInfo) => {
        this.openModal();
        let seconds = 0
        do {
            await this.sleep(1000);
            seconds += 1
        } while (this.state.showModal && seconds < 100)
        this.closeModal();
        let calendarApi = selectInfo.view.calendar
        calendarApi.unselect() // clear date selection
        if (this.state.title && this.state.description && this.state.priority) {
            await calendarApi.addEvent({
                id: 0,
                title: this.state.title,
                description: this.state.description,
                priority: this.state.priority,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            })
            this.setState({
                title: "",
                description: "",
                priority: ""
            })
            await this.getEvents()
        }
    }

    handleEditEvent = async (id) => {
        this.openEditModal();
        let seconds = 0
        do {
            await this.sleep(1000);
            seconds += 1
        } while (this.state.showEditModal && seconds < 100)
        this.closeEditModal();
        const { edited } = this.state;
        if (edited) { await this.updateEventContent(id); }

    }

    updateEventContent = async (id) => {
        const { editTitle, editDescription, editPriority } = this.state;
        await axios.put(`${process.env.MIX_API_URL}/events/${id}`, {
            title: editTitle,
            description: editDescription,
            priority: editPriority,
            editType: "content"
        });
        this.setState({
            editTitle: "",
            editDescription: "",
            editPriority: "",
            edited: false
        })
        await this.getEvents()
    }

    sleep = async (msec) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    openModal = () => { this.setState({ showModal: true }) }

    closeModal = () => { this.setState({ showModal: false }) }

    openEditModal = () => { this.setState({ showEditModal: true }) }

    closeEditModal = () => { this.setState({ showEditModal: false }) }

    handleEventClick = async (clickInfo) => {
        let eventOrTaskTitle = clickInfo.event.title.substring(3);
        if (clickInfo.event.title.charAt(0) === "E") {
            await swal("Would you like to edit or delete the event?", {

                buttons: {
                    delete: {
                        text: "Delete",
                        value: "delete",
                        className: "swalDelete"
                    },
                    edit: {
                        text: "Edit",
                        value: "edit",
                        className: "swalEdit"
                    },
                    cancelClick: {
                        text: "Cancel",
                        value: "cancel",
                        className: "swalCancel"
                    },
                },
            }).then(async (value) => {
                switch (value) {
                    case "delete":
                        swal({
                            title: `Are you sure you want to delete the event "${eventOrTaskTitle}"`,
                            text: "Once deleted, you won't be able to recover the data.",
                            icon: "warning",
                            buttons: ["Cancel", "Delete"],
                            dangerMode: true,
                        }).then(async (willDelete) => {
                            if (willDelete) {
                                clickInfo.event.remove()
                                await this.getEvents()
                            }
                        });
                        break;
                    case "edit":
                        let res = await axios.get(`${process.env.MIX_API_URL}/events/${clickInfo.event.id}/edit`)
                        this.setState({
                            editTitle: res.data.event.title.substring(3),
                            editDescription: res.data.event.description,
                            editPriority: res.data.event.priority,
                        })
                        this.handleEditEvent(clickInfo.event.id);
                        break;
                    case "cancel":
                    default:
                }
            })
        } else {
            swal("Edit details?", {
                buttons: {
                    edit: {
                        text: "Edit",
                        value: "edit",
                        className: "swalEdit"
                    },
                    cancelClick: {
                        text: "Cancel",
                        value: "cancel",
                        className: "swalCancel"
                    },
                },
            }).then(async (value) => {
                switch (value) {
                    case "edit":
                        let res = await axios.get(`${process.env.MIX_API_URL}/events/getTaskId/${clickInfo.event.id}`)
                        this.props.history.push(`/taskLists/${res.data.taskId.toString()}/edit`)
                        break;
                    case "cancel":
                    default:
                }
            })
        }

    }

    handleEvents = (events) => {
        this.setState({
            currentEvents: events
        })
    }

    handleAdd = async (addInfo) => {
        await axios.post(`${process.env.MIX_API_URL}/events`, {
            title: addInfo.event.title,
            description: this.state.description,
            priority: this.state.priority,
            start: addInfo.event.start,
            end: addInfo.event.end
        });
    }

    handleCalendarChange = async (changeInfo) => {
        if (changeInfo.event.title.charAt(0) === "E") {
            const id = changeInfo.event.id;
            await axios.put(`${process.env.MIX_API_URL}/events/${id}`, {
                title: changeInfo.event.title,
                start: changeInfo.event.start,
                end: changeInfo.event.end,
                editType: "date"
            });
        } else {
            this.setState({ loading: true });
            let taskTitle = changeInfo.event.title.substring(3);
            swal({
                title: `You can't change the due date here for "${taskTitle}"`,
                text: "Go to My Task instead.",
                icon: "warning",
                buttons: "OK",
            }).then(() => {
                this.setState({ loading: false });
            })
        }
    }

    handleRemove = async (removeInfo) => {
        const id = removeInfo.event.id;
        await axios.delete(`${process.env.MIX_API_URL}/events/${id}`);
    }

    renderSidebar = () => {
        return (
            <div className='demo-app-sidebar'>
                <div className='demo-app-sidebar-section'>
                    <h2>Instructions</h2>
                    <ul>
                        <li>Select dates and you will be prompted to create a new event</li>
                        <li>Drag, drop, and resize events</li>
                        <li>Click an event to delete it</li>
                    </ul>
                </div>
                <div className='demo-app-sidebar-section'>
                    <label>
                        <input
                            type='checkbox'
                            checked={this.state.weekendsVisible}
                            onChange={this.handleWeekendsToggle}
                            style={{ marginRight: "10px" }}
                        ></input>
                        toggle weekends
                    </label>
                </div>
            </div>
        )
    }

    renderEventContent = (eventInfo) => {
        return (
            <>
                <b>{eventInfo.timeText}</b>
                <i>{eventInfo.event.title}</i>
            </>
        )
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); };

    handleSelectChange = (value, obj, inputType) => {
        switch (inputType) {
            case "priority":
                this.setState({ priority: obj.name })
                break;
            case "editPriority":
                this.setState({
                    editPriority: obj.name,
                    edited: true
                })
                break;
            default:
        }
    }

    handleEditChange = event => {
        this.setState({
            [event.target.name]: event.target.value,
            edited: true
        });
    };

    renderModal = () => {
        const { title, description, priority, showModal } = this.state;
        return (
            <div >
                <ReactModal
                    isOpen={showModal}
                    ariaHideApp={false}
                    style={{
                        overlay: {
                            position: "absolute",
                            left: "350px",
                            margin: "auto",
                            width: "700px",
                            height: "500px",
                            zIndex: 9999
                        }
                    }}
                >
                    <CreateModal
                        title={title}
                        description={description}
                        priority={priority}
                        closeModal={this.closeModal}
                        handleChange={this.handleChange}
                        handleSelectChange={this.handleSelectChange} />
                </ReactModal>
            </div >
        )
    }

    renderEditModal = () => {
        const { editTitle, editDescription, editPriority, showEditModal } = this.state;
        return (
            <div >
                <ReactModal
                    isOpen={showEditModal}
                    ariaHideApp={false}
                    style={{
                        overlay: {
                            position: "absolute",
                            left: "350px",
                            margin: "auto",
                            width: "700px",
                            height: "500px",
                            zIndex: 9999
                        }
                    }}
                >
                    <EditModal
                        title={editTitle}
                        description={editDescription}
                        priority={editPriority}
                        closeModal={this.closeEditModal}
                        handleEditChange={this.handleEditChange}
                        handleSelectChange={this.handleSelectChange} />
                </ReactModal>
            </div >
        )
    }

    render() {
        const { weekendsVisible, events, loading } = this.state;
        return (
            <div className="centerVaH">
                {loading ? <Spinner text="Loading..." /> :
                    <div className='demo-app'>
                        {this.renderSidebar()}
                        {this.renderModal()}
                        {this.renderEditModal()}
                        <div className='demo-app-main'>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                initialView='dayGridMonth'
                                allDaySlot={false}
                                displayEventTime={false}
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                weekends={weekendsVisible}
                                events={events}
                                select={this.handleDateSelect}
                                eventContent={this.renderEventContent}
                                eventClick={this.handleEventClick}
                                eventsSet={this.handleEvents}
                                eventAdd={this.handleAdd}
                                eventChange={this.handleCalendarChange}
                                eventRemove={this.handleRemove}
                                eventDisplay="block"
                            />
                        </div>
                    </div>}
            </div>
        )
    }
}

export default Event;