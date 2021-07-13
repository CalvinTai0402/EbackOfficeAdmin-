import React from 'react'
import FullCalendar, { formatDate } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createEventId } from './event-utils'
import Spinner from '../Spinner'

class Event extends React.Component {
    state = {
        weekendsVisible: true,
        currentEvents: [],
        events: [],
        laoding: false,
    }

    async componentDidMount() {
        await this.getEvents();
    }

    getEvents = async () => {
        this.setState({ loading: true })
        const res = await axios.get(`/events`);
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
        let title = prompt('Please enter a new title for your event')
        let calendarApi = selectInfo.view.calendar
        calendarApi.unselect() // clear date selection
        if (title) {
            calendarApi.addEvent({
                id: createEventId(),
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            })
        }
        await this.getEvents()
    }

    handleEventClick = (clickInfo) => {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
            clickInfo.event.remove()
        }
    }

    handleEvents = (events) => {
        this.setState({
            currentEvents: events
        })
    }

    handleAdd = async (addInfo) => {
        await axios.post('/events', {
            title: addInfo.event.title,
            start: addInfo.event.start,
            end: addInfo.event.end
        });
    }

    handleChange = async (changeInfo) => {
        const id = changeInfo.event.id;
        await axios.put(`/events/${id}`, {
            title: changeInfo.event.title,
            start: changeInfo.event.start,
            end: changeInfo.event.end
        });
    }

    handleRemove = async (removeInfo) => {
        const id = removeInfo.event.id;
        await axios.delete(`/events/${id}`);
    }

    renderSidebar = () => {
        const { events } = this.state;
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
                        ></input>
                        toggle weekends
                    </label>
                </div>
                <div className='demo-app-sidebar-section'>
                    <h2>All Events ({events.length})</h2>
                    <ul>
                        {events.map(this.renderSidebarEvent)}
                    </ul>
                </div>
            </div>
        )
    }

    renderSidebarEvent = (event) => {
        return (
            <li key={event.id}>
                <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
                <i>{event.title}</i>
            </li>
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
    render() {
        const { weekendsVisible, events, loading } = this.state;
        return (
            <div>
                {loading ? <Spinner text="Loading..." /> :
                    <div className='demo-app'>
                        {this.renderSidebar()}
                        <div className='demo-app-main'>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                initialView='dayGridMonth'
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
                                eventChange={this.handleChange}
                                eventRemove={this.handleRemove}
                            />
                        </div>
                    </div>}
            </div>
        )
    }
}

export default Event;