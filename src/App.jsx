import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import ContactField from "./components/atom/ContactField";
import { subDays } from "date-fns";

const ZOHO = window.ZOHO;

// Create a ZohoContext to hold the ZOHO data
const ZohoContext = createContext();

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [laborData, setLaborData] = useState([]);
  const [events, setEvents] = useState([]);
  const [todo, setTodo] = useState([]);
  const [calls, setCalls] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }, []);

  useEffect(() => {
    async function getData() {
      if (zohoLoaded) {
        const allMeetings = await ZOHO.CRM.API.getAllRecords({
          Entity: "Events",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setEvents(allMeetings.data);

        const usersResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "users",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setUsers(usersResponse.users); // assuming users data is available here

        // function formatDateToCOQL(date) {
        //   const year = date.getFullYear();
        //   const month = String(date.getMonth() + 1).padStart(2, "0");
        //   const day = String(date.getDate()).padStart(2, "0");
        //   const hours = String(date.getHours()).padStart(2, "0");
        //   const minutes = String(date.getMinutes()).padStart(2, "0");
        //   const seconds = String(date.getSeconds()).padStart(2, "0");

        //   // Get timezone offset in '+hh:mm' or '-hh:mm' format
        //   const timezoneOffset = -date.getTimezoneOffset();
        //   const sign = timezoneOffset >= 0 ? "+" : "-";
        //   const offsetHours = String(
        //     Math.floor(Math.abs(timezoneOffset) / 60)
        //   ).padStart(2, "0");
        //   const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(
        //     2,
        //     "0"
        //   );

        //   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
        // }

        // // Get the current date and subtract days as needed for your filter
        // const today = new Date();
        // const last7Days = subDays(today, 7); // Subtract 7 days from today

        // // Format dates for COQL
        // const startDate = formatDateToCOQL(last7Days);
        // const endDate = formatDateToCOQL(today);

        // // COQL query to fetch contacts created within the last 7 days
        // var config = {
        //   select_query: `select End_DateTime, Created_Time,Event_Priority,Event_Title,Description,id from Events where Created_Time between '${startDate}' and '${endDate}'`,
        // };

        // await ZOHO.CRM.API.coql(config).then(function (data) {
        //   console.log(data);
        // });
      }
    }
    getData();
  }, [zohoLoaded]);

  return (
    // Wrap your components with the ZohoContext.Provider
    <ZohoContext.Provider value={{ users, events, todo, ZOHO }}>
      <ActivityTable events={events} todo={todo} ZOHO={ZOHO} users={users} />
    </ZohoContext.Provider>
  );
}

export default App;
