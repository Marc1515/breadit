"use client";

import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import axios from "axios";

interface CalendarBoxProps {
  isAdmin: boolean; // Prop para verificar si es administrador
}

export const CalendarBox = ({ isAdmin }: CalendarBoxProps) => {
  const localizer = dayjsLocalizer(dayjs);

  const [events, setEvents] = useState<
    { id: string; title: string; start: Date; end: Date }[]
  >([]);

  const [error, setError] = useState<string | null>(null); // Estado para manejar mensajes de error

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
    const start = dayjs(newEvent.start);
    const end = dayjs(newEvent.end);

    // Validar que la fecha de fin sea mayor que la fecha de inicio
    if (end.isBefore(start)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return; // Detener la ejecución si hay un error
    }

    setError(null); // Limpiar el mensaje de error si las fechas son válidas

    if (newEvent.title && newEvent.start && newEvent.end) {
      const newEventObj = {
        title: newEvent.title,
        start: start.toISOString(),
        end: end.toISOString(),
      };

      // Enviar el evento a la base de datos usando Axios
      try {
        const res = await axios.post("/api/calendar/create", newEventObj);

        if (res.status !== 200) {
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

  // Función para eliminar un evento usando Axios
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await axios.delete(`/api/calendar/delete`, {
        params: { id: eventId },
      });

      if (res.status !== 200) {
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
      {/* Mostrar sección de creación de eventos solo si el usuario es administrador */}
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
          {error && <p style={{ color: "red" }}>{error}</p>}
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
        <>
          <h3>Lista de eventos:</h3>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> - {event.start.toLocaleString()}{" "}
                a {event.end.toLocaleString()}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
