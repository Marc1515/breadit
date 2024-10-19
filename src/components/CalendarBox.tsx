"use client";

import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";

export const CalendarBox = () => {
  const localizer = dayjsLocalizer(dayjs);

  const [events, setEvents] = useState<
    { id: string; title: string; start: Date; end: Date }[]
  >([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Cambia esto según tu lógica de autenticación

  // Función para obtener eventos desde la base de datos
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar/get");

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await res.json();

      // Convertir las fechas a objetos Date
      const eventsWithDate = data.map((event: any) => ({
        ...event,
        start: new Date(event.start), // Convertir las fechas a Date
        end: new Date(event.end), // Convertir las fechas a Date
      }));

      setEvents(eventsWithDate);
    } catch (error) {
      console.error(error);
      if (isAuthenticated) {
        alert("Error al obtener eventos");
      }
    }
  };

  useEffect(() => {
    // Obtener los eventos al cargar el componente
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
    if (newEvent.title && newEvent.start && newEvent.end) {
      const newEventObj = {
        title: newEvent.title,
        start: dayjs(newEvent.start).toISOString(),
        end: dayjs(newEvent.end).toISOString(),
      };

      // Enviar el evento a la base de datos
      try {
        const res = await fetch("/api/calendar/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEventObj),
        });

        if (!res.ok) {
          throw new Error("Failed to save event");
        }

        // Limpiar los inputs después de agregar el evento
        setNewEvent({
          title: "",
          start: "",
          end: "",
        });

        // Volver a obtener los eventos desde la base de datos
        await fetchEvents();
      } catch (error) {
        console.error(error);
        alert("Error al guardar el evento");
      }
    }
  };

  // Función para eliminar un evento
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/calendar/delete?id=${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      // Volver a obtener los eventos actualizados
      await fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el evento");
    }
  };

  return (
    <div>
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

      <div style={{ marginTop: "20px" }}>
        <Calendar
          localizer={localizer}
          style={{ height: 350, width: 350 }}
          events={events} // Pasar los eventos con fechas como objetos Date
        />
      </div>

      <h3>Lista de eventos:</h3>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> - {event.start.toLocaleString()} a{" "}
            {event.end.toLocaleString()}
            <button
              onClick={() => handleDeleteEvent(event.id)}
              style={{ marginLeft: "10px" }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
