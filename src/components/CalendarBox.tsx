"use client";

import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";

interface CalendarBoxProps {
  isAdmin: boolean; // Prop para verificar si es administrador
}

export const CalendarBox = ({ isAdmin }: CalendarBoxProps) => {
  const localizer = dayjsLocalizer(dayjs);

  const [events, setEvents] = useState<
    { id: string; title: string; start: Date; end: Date }[]
  >([]);

  const [error, setError] = useState<string | null>(null); // Estado para manejar mensajes de error

  // Función para obtener eventos desde la base de datos usando fetch
  const fetchEvents = async () => {
    try {
      // Agregar un parámetro de tiempo único para evitar el almacenamiento en caché
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/calendar/get?t=${timestamp}`, {
        cache: "no-store",
      });
      const data = await res.json();

      // Convertir las fechas a objetos Date
      const eventsWithDate = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(eventsWithDate);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
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

  // Función para invalidar la caché en Vercel y desencadenar un nuevo despliegue
  const invalidateCache = async () => {
    try {
      const webhookUrl = "URL_DEL_WEBHOOK_DE_VERCEL"; // Reemplaza con tu URL de webhook

      // Realizar una solicitud POST al webhook
      await fetch(webhookUrl, { method: "POST" });

      console.log("Cache invalidada y despliegue iniciado.");
    } catch (error) {
      console.error("Error al invalidar la caché:", error);
    }
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

      // Enviar el evento a la base de datos usando fetch
      try {
        const res = await fetch("/api/calendar/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEventObj),
        });

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

        // Invalida la caché después de añadir el evento
        await invalidateCache();
      } catch (error) {
        console.error("Error al guardar el evento:", error);
        alert("Error al guardar el evento");
      }
    }
  };

  // Función para eliminar un evento usando fetch
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/calendar/delete?id=${eventId}`, {
        method: "DELETE",
      });

      if (res.status !== 200) {
        throw new Error("Failed to delete event");
      }

      // Volver a obtener los eventos actualizados
      await fetchEvents();

      // Invalida la caché después de eliminar el evento
      await invalidateCache();
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
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
