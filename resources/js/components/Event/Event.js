import React from 'react'
import FullCalendar, { formatDate } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ReactModal from 'react-modal';
import Spinner from '../Spinner'
import ModalForm from './ModalForm'
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
        title: "",
        description: "",
        priority: ""
    }

    async componentDidMount() {
        await this.getEvents();
        document.body.style.overflow = "hidden" // fix for ReactModal taking up white space
    }

    componentWillUnmount() {
        document.body.style.overflow = "visible" // fix for ReactModal taking up white space
    }

    getEvents = async () => {
        this.setState({ loading: true })
        const res = await axios.get(`${process.env.MIX_API_URL}/events`);
        if (res.data.status == 200) {
            this.setState({ loading: false })
            this.setState({ events: res.data.events })
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
            console.log("Polling...")
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

    sleep = async (msec) => {
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    openModal = () => { this.setState({ showModal: true }) }

    closeModal = () => { this.setState({ showModal: false }) }

    handleEventClick = async (clickInfo) => {
        let eventOrTaskTitle = clickInfo.event.title.substring(3);
        if (clickInfo.event.title.charAt(0) === "E") {
            await swal({
                title: `Are you sure you want to delete the event "${eventOrTaskTitle}"`,
                text: "Once deleted, you won't be able to recover the data.",
                icon: "warning",
                buttons: ["Cancel", "Delete"],
                dangerMode: true,
            }).then(async (willDelete) => {
                if (willDelete) {
                    clickInfo.event.remove()
                }
            });
            await this.getEvents()
        } else {
            this.setState({ loading: true });
            swal("Edit details?", {
                buttons: {
                    // delete: {
                    //     text: "Delete",
                    //     value: "delete",
                    // },
                    edit: {
                        text: "Edit details",
                        value: "edit",
                    },
                    cancelClick: {
                        text: "Cancel",
                        value: "cancel",
                    },
                },
            }).then(async (value) => {
                switch (value) {
                    // case "delete":
                    //     swal({
                    //         title: `Are you sure you want to delete the task "${eventOrTaskTitle}"`,
                    //         text: "Once deleted, you won't be able to recover the data.",
                    //         icon: "warning",
                    //         buttons: ["Cancel", "Delete"],
                    //         dangerMode: true,
                    //     }).then(async (willDelete) => {
                    //         if (willDelete) {
                    //             clickInfo.event.remove()
                    //         }
                    //     });
                    //     break;
                    case "edit":
                        let res = await axios.get(`${process.env.MIX_API_URL}/events/getTaskId/${clickInfo.event.id}`)
                        console.log(res.data.taskId)
                        this.props.history.push(`/taskLists/${res.data.taskId.toString()}/edit`)
                        break;
                    case "cancel":
                        break;
                    default:
                }
            }).then(() => {
                this.setState({ loading: false });
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
                end: changeInfo.event.end
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
            default:
        }
    }

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
                    <ModalForm
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

    render() {
        const { weekendsVisible, events, loading } = this.state;
        return (
            <div>
                {loading ? <Spinner text="Loading..." /> :
                    <div className='demo-app'>
                        {this.renderSidebar()}
                        {this.renderModal()}
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
                            />
                        </div>
                    </div>}
            </div>
        )
    }
}

export default Event;