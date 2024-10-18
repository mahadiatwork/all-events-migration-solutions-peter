import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import ContactField from "./components/atom/ContactField";

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
