"use client";

import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import axios from "axios";

interface CalendarBoxProps {
  isAdmin: boolean;
  initialEvents: { id: string; title: string; start: Date; end: Date }[];
}

export const CalendarBox = ({ isAdmin, initialEvents }: CalendarBoxProps) => {
  const localizer = dayjsLocalizer(dayjs);

  // Usa los eventos iniciales del servidor
  const [events, setEvents] = useState(initialEvents);

  // Función para obtener eventos desde la base de datos usando Axios
  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/calendar/get");
      const data = res.data;

      // Convertir las fechas a objetos Date
      const eventsWithDate = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(eventsWithDate);
    } catch (error) {
      console.error(error);
      alert("Error al obtener eventos");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = async () => {
    const start = dayjs(newEvent.start);
    const end = dayjs(newEvent.end);

    if (end.isBefore(start)) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (newEvent.title && newEvent.start && newEvent.end) {
      const newEventObj = {
        title: newEvent.title,
        start: start.toISOString(),
        end: end.toISOString(),
      };

      try {
        const res = await axios.post("/api/calendar/create", newEventObj);
        if (res.status !== 200) {
          throw new Error("Failed to save event");
        }

        setNewEvent({ title: "", start: "", end: "" });
        await fetchEvents();
      } catch (error) {
        console.error(error);
        alert("Error al guardar el evento");
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await axios.delete(`/api/calendar/delete`, {
        params: { id: eventId },
      });
      if (res.status !== 200) {
        throw new Error("Failed to delete event");
      }
      await fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el evento");
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="flex flex-col">
          <h3>New Event:</h3>
          <input
            type="text"
            name="title"
            placeholder="Event Title..."
            value={newEvent.title}
            onChange={handleInputChange}
          />
          <h3>Start:</h3>
          <input
            type="datetime-local"
            name="start"
            value={newEvent.start}
            onChange={handleInputChange}
          />
          <h3>End:</h3>
          <input
            type="datetime-local"
            name="end"
            value={newEvent.end}
            onChange={handleInputChange}
          />
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <Calendar
          localizer={localizer}
          style={{ height: 350, width: 350 }}
          events={events}
        />
      </div>

      {isAdmin && (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong> - {event.start.toLocaleString()} a{" "}
              {event.end.toLocaleString()}
              <button onClick={() => handleDeleteEvent(event.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
