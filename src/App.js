import React, { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [year, setYear] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);

  const [modalEventData, setModalEventData] = useState({
    month: "",
    day: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = (month, day) => {
    setModalEventData({ month, day });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEventData({
      month: "",
      day: null,
    });
    setIsEditing(false);
    setSelectedEvent(null);
  };

  function generateDays(month, year) {
    const firstDay = new Date(year, months.indexOf(month), 1);
    const lastDay = new Date(year, months.indexOf(month) + 1, 0);

    const daysInMonth = [];
    for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
      daysInMonth.push({
        day: day.getDate(),
        dayname: getDayName(day.getDay()),
        events: [],
      });
    }

    return daysInMonth;
  }

  function getDayName(dayIndex) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek[dayIndex];
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const createJson = (year) => {
    let data = {
      months: months,
      year: year,
    };
    for (let i = 0; i < months.length; i++) {
      let month = months[i];
      let days = generateDays(month, year);

      let monthData = {
        days: days,
      };

      data[month] = monthData;
    }
    setCalendarData(data);
    setYear(year);
  };

  const handleSaveEvent = (
    eventName,
    isFullDay,
    startTime,
    endTime,
    isEditing
  ) => {
    const { month, day } = modalEventData;
    if (isEditing) {
      handleEditEvent(month, day, selectedEvent.id, {
        id: selectedEvent.id,
        title: eventName,
        fullDay: isFullDay,
        startTime: startTime,
        endTime: endTime,
      });
    } else {
      handleAddEvent(month, day, eventName, isFullDay, startTime, endTime);
    }

    closeModal();
  };

  const handleEditEventClick = (event, month, day) => {
    setIsEditing(true);
    setSelectedEvent(event);
    openModal(month, day);
  };

  const handleAddEvent = (month, day, title, isFullDay, startTime, endTime) => {
    let tmp = calendarData[month];
    tmp.days[day.day - 1].events.push({
      id: Math.random(),
      title: title,
      fullDay: isFullDay,
      startTime: startTime,
      endTime: endTime,
    });

    let newData = {
      ...calendarData,
      [month]: tmp,
    };
    localStorage.setItem("calendarData", JSON.stringify(newData));
    const currentTime = new Date().toLocaleString();
    localStorage.setItem("calendarDataSaved", currentTime);
    setCalendarData(newData);
  };

  const handleEditEvent = (month, day, eventId, eventData) => {
    let tmp = calendarData[month];
    tmp.days[day.day - 1].events = tmp.days[day.day - 1].events.map((event) => {
      if (event.id === eventId) {
        return eventData;
      }
      return event;
    });
    let newData = {
      ...calendarData,
      [month]: tmp,
    };
    localStorage.setItem("calendarData", JSON.stringify(newData));
    const currentTime = new Date().toLocaleString();
    localStorage.setItem("calendarDataSaved", currentTime);
    setCalendarData(newData);
  };

  const handleDeleteEvent = (month, day, eventId) => {
    let tmp = calendarData[month];
    tmp.days[day.day - 1].events = tmp.days[day.day - 1].events.filter(
      (event) => event.id !== eventId
    );
    setCalendarData({
      ...calendarData,
      [month]: tmp,
    });
  };

  const MonthView = ({ month, index }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <div key={index} className="month-container">
        <div
          className={`month-header ${
            calendarData[month]?.collapsed ? "collapsed" : ""
          }`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {month}
        </div>
        <div
          className={`dates-container`}
          style={{ display: collapsed ? "none" : "flex" }}
        >
          {calendarData[month]?.days.map((day, dayIndex) => (
            <DateView key={dayIndex} day={day} month={month} />
          ))}
        </div>
      </div>
    );
  };

  const DateView = ({ day, month }) => {
    return (
      <div className="date-box">
        <div className="top-row">
          <div className="day-name">{day.dayname}</div>
          <div className="day-number">{day.day}</div>
          <div
            className="add-event"
            onClick={() => {
              setIsEditing(false);
              openModal(month, day);
            }}
          >
            +
          </div>
        </div>
        <div className="events">
          {day.events.map((event, index) => (
            <EventView key={index} event={event} day={day} month={month} />
          ))}
        </div>
      </div>
    );
  };

  const EventView = ({ event, day, month }) => {
    return (
      <div className="event-container">
        <div className="event-title">
          {event.title}
          {event.fullDay === false && (
            <span>
              {" "}
              {event.startTime} - {event.endTime}
            </span>
          )}
        </div>
        <div
          className="edit-icon"
          onClick={() => handleEditEventClick(event, month, day)}
        >
          E{" "}
        </div>
        <div
          className="delete-icon"
          onClick={() => handleDeleteEvent(month, day, event.id)}
        >
          D{" "}
        </div>
      </div>
    );
  };

  const ModalView = ({ onSave, onCancel }) => {
    const [eventName, setEventName] = useState("");
    const [isFullDay, setIsFullDay] = useState(true);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
      if (isEditing && selectedEvent) {
        setEventName(selectedEvent.title);
        setIsFullDay(selectedEvent.fullDay);
        setStartTime(selectedEvent.startTime);
        setEndTime(selectedEvent.endTime);
      }
    }, []);

    return (
      <div className="modal-container">
        <div className="modal-content">
          <label>Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            <label>Full Day:</label>
            <input
              style={{ width: "20px", height: "20px" }}
              type="checkbox"
              checked={isFullDay}
              onChange={() => setIsFullDay(!isFullDay)}
            />
          </div>

          {!isFullDay && (
            <>
              <label>Start Time:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />

              <label>End Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </>
          )}

          <button
            onClick={() =>
              onSave(eventName, isFullDay, startTime, endTime, isEditing)
            }
          >
            Save
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  };

  const loadJSON = (jsonUrl) => {
    return fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        // Basic validation
        if (
          !data ||
          typeof data !== "object" ||
          !("year" in data) ||
          !("months" in data)
        ) {
          alert("Invalid JSON format: Missing required keys.");
          return;
        }

        const requiredMonthKeys = ["days"]; // Add more keys if necessary

        for (const monthData of Object.values(data.months)) {
          if (
            typeof data[monthData] !== "object" ||
            !requiredMonthKeys.every((key) => key in data[monthData])
          ) {
            alert("Invalid JSON format: Missing required month keys.");
            return;
          }
        }

        // If all validation passes, update the state
        setCalendarData(data);
        setYear(data.year);
      })
      .catch((error) => {
        console.error("Error loading JSON:", error);
        alert("Error loading JSON. Please check the URL and try again.");
      });
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(calendarData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${year}_events.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePasteJson = (json) => {
    try {
      const parsedData = JSON.parse(json);

      // Basic validation for pasted JSON
      if (
        !parsedData ||
        typeof parsedData !== "object" ||
        !("year" in parsedData) ||
        !("months" in parsedData)
      ) {
        alert("Invalid JSON format: Missing required keys.");
        return;
      }

      const requiredMonthKeys = ["days"]; // Add more keys if necessary

      for (const monthData of Object.values(parsedData.months)) {
        if (
          typeof parsedData[monthData] !== "object" ||
          !requiredMonthKeys.every((key) => key in parsedData[monthData])
        ) {
          alert("Invalid JSON format: Missing required month keys.");
          return;
        }
      }

      setCalendarData(parsedData);
      setYear(parsedData.year);
    } catch (error) {
      console.error("Error parsing pasted JSON:", error);
      alert("Invalid JSON format. Please check the input and try again.");
    }
  };

  const CalendarView = () => {
    return (
      <>
        <div className="header-container">
          <div className="year-header">{year}</div>
          <div>
            <button onClick={downloadJson}>Download </button>
          </div>
        </div>
        <div className="calendar-container">
          {calendarData.months?.map((month, index) => (
            <MonthView key={index} month={month} />
          ))}
        </div>
        {isModalOpen && (
          <ModalView onSave={handleSaveEvent} onCancel={closeModal} />
        )}
      </>
    );
  };

  const NewDataView = () => {
   const [activeTab, setActiveTab] = useState("new");
   const [selectedYear, setSelectedYear] = useState("");
   const handleTabClick = (tab) => {
     setActiveTab(tab);
   };
   const currentYear = new Date().getFullYear();
   const years = [...Array(6)].map((_, index) => currentYear + index);
   const [jsonUrl, setJsonUrl] = useState(null);
   const [pasteJson, setPasteJson] = useState("");
   const [editedJson, setEditedJSON] = useState(null);
   const [lastEditedDateTime, setLastEditedDateTime] = useState("");
   useEffect(() => {
     let cd = localStorage.getItem("calendarData");
     if (cd) {
       setEditedJSON(cd);
       setActiveTab("load");
       const lastEditedDateTime = localStorage.getItem("calendarDataSaved");
       setLastEditedDateTime(lastEditedDateTime);
     }
   }, []);
   return (
     <>
       <ul className="nav-container">
         <li
           className={`nav-item ${activeTab === "new" ? "active" : ""}`}
           onClick={() => handleTabClick("new")}
         >
           New Data
         </li>
         <li
           className={`nav-item ${activeTab === "load" ? "active" : ""}`}
           onClick={() => handleTabClick("load")}
         >
           Load Data
         </li>
       </ul>
       <div className="data-view-container">
         <div className={`new-data ${activeTab !== "new" ? "hidden" : ""}`}>
           <div>
             <label htmlFor="yearSelect">Year:</label>
             <select
               id="yearSelect"
               value={selectedYear}
               onChange={(e) => setSelectedYear(e.target.value)}
             >
               <option value="">Select Year</option>
               {years.map((year) => (
                 <option key={year} value={year}>
                   {year}
                 </option>
               ))}
             </select>
           </div>
           <button
             onClick={() => {
               createJson(selectedYear);
             }}
           >
             Create Json
           </button>
           <hr />
         </div>
         <div className={`load-data ${activeTab !== "load" ? "hidden" : ""}`}>
           <div> Load an Json </div>
           {editedJson && (
             <div
               onClick={() => handlePasteJson(editedJson)}
               className="text-button"
             >
               Load Last Edited Data (Last edited: {lastEditedDateTime})
             </div>
           )}
           <hr />
           <input
             type="text"
             placeholder="Enter JSON URL..."
             value={jsonUrl}
             onChange={(e) => setJsonUrl(e.target.value)}
           />
           <button onClick={() => loadJSON(jsonUrl)}>Load Json </button>
           <hr />
           <textarea
             value={pasteJson}
             onChange={(e) => setPasteJson(e.target.value)}
             rows="4"
             cols="50"
             placeholder="Paste JSON here..."
           ></textarea>
           <button onClick={() => handlePasteJson(pasteJson)}>
             Load from Paste
           </button>
           <hr />
         </div>
       </div>
     </>
   );
  };
  return <div>{year ? <CalendarView /> : <NewDataView />}</div>;
}
